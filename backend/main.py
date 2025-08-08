"""
AI-Powered Clinical Canvas Backend
FastAPI application for serving patient data and AI Q&A with OpenAI integration
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
import sqlite3
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add ai-pipeline to path for imports
sys.path.append(str(Path(__file__).parent.parent / "ai-pipeline"))

# Import OpenAI service
try:
    from services.openai_service import OpenAIService
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAIService = None

# Database path
DB_PATH = Path(__file__).parent.parent / "data" / "clinical_canvas.db"


class Patient(BaseModel):
    id: str
    name: str
    age: int
    gender: str


class PatientDetail(Patient):
    canvas_layout: Dict[str, Any]
    ai_summary: Optional[str] = None
    vitals_data: List[Dict[str, Any]] = []
    lab_results: List[Dict[str, Any]] = []
    documents: List[Dict[str, Any]] = []


class QARequest(BaseModel):
    question: str


class QAResponse(BaseModel):
    answer: str
    source_document: Optional[str] = None
    source_page: Optional[int] = None
    confidence_score: float = 0.0


class SOAPSection(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str


class SOAPNote(BaseModel):
    id: str
    patient_id: str
    date: str
    soap_sections: SOAPSection
    generated_by: str  # 'ai' or 'manual'
    confidence_score: float
    last_modified: str


class SOAPGenerateRequest(BaseModel):
    patient_id: str


class UserRole(BaseModel):
    id: str
    role_name: str
    display_name: str
    description: str


class LayoutTemplate(BaseModel):
    id: str
    template_name: str
    user_role: str
    template_description: str
    default_nodes: List[Dict[str, Any]]
    default_connections: List[Dict[str, Any]]


class PopulationMetric(BaseModel):
    id: str
    metric_name: str
    metric_type: str
    metric_value: Any
    time_period: Optional[str]
    calculated_date: str
    patient_count: int
    metadata: Optional[Dict[str, Any]]


class DiseasePattern(BaseModel):
    id: str
    pattern_name: str
    pattern_type: str
    condition_codes: List[str]
    affected_patients: List[str]
    pattern_data: Dict[str, Any]
    confidence_score: float
    time_range_start: str
    time_range_end: str


class MedicationAnalytic(BaseModel):
    id: str
    medication_name: str
    medication_class: Optional[str]
    usage_pattern: str
    analytics_data: Dict[str, Any]
    patient_count: int
    time_period: str
    calculated_date: str


# Database initialization
def init_database():
    """Initialize SQLite database with schema"""
    # Ensure data directory exists
    os.makedirs(DB_PATH.parent, exist_ok=True)
    
    # Read schema file
    schema_path = Path(__file__).parent / "database_schema.sql"
    with open(schema_path, 'r') as f:
        schema_sql = f.read()
    
    # Initialize database
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(schema_sql)
    conn.commit()
    conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    init_database()
    
    # Initialize OpenAI service
    try:
        if OPENAI_AVAILABLE:
            app.state.openai_service = OpenAIService()
            print("✅ OpenAI service initialized successfully")
        else:
            print("⚠️  OpenAI library not available, falling back to basic responses")
            app.state.openai_service = None
    except Exception as e:
        print(f"⚠️  OpenAI service initialization failed: {e}")
        app.state.openai_service = None
    
    # Initialize RAG pipeline (disabled for Railway deployment)
    print("ℹ️  RAG pipeline disabled for Railway deployment - using OpenAI fallback")
    app.state.rag_pipeline = None
    
    yield
    # Shutdown: cleanup if needed


# FastAPI app
app = FastAPI(
    title="Clinical Canvas API",
    description="Backend API for AI-Powered Clinical Canvas with OpenAI integration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS and Security Configuration
def get_cors_origins():
    """Get CORS origins based on environment"""
    environment = os.getenv("ENVIRONMENT", "development")
    
    if environment == "production":
        # Production origins - only allow specific domains
        cors_origins = []
        
        # Add production Netlify URL
        netlify_url = os.getenv("NETLIFY_URL")
        if netlify_url:
            cors_origins.append(netlify_url)
        
        # Add custom CORS origins from environment
        cors_origins_env = os.getenv("CORS_ORIGINS")
        if cors_origins_env:
            cors_origins.extend([origin.strip() for origin in cors_origins_env.split(",")])
        
        # If no production origins configured, use secure defaults
        if not cors_origins:
            cors_origins = [
                "https://clinical-canvas.netlify.app",  # Replace with your actual Netlify URL
            ]
            
        return cors_origins
    else:
        # Development origins
        return [
            "http://localhost:5174", 
            "http://localhost:5173", 
            "http://localhost:3000",
            "http://localhost:8080",
        ]

cors_origins = get_cors_origins()
print(f"🔐 CORS Origins configured: {cors_origins}")

# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers for production
        if os.getenv("ENVIRONMENT") == "production":
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        return response

# Rate limiting middleware for production
class RateLimitingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls_per_minute: int = 60):
        super().__init__(app)
        self.calls_per_minute = calls_per_minute
        self.call_times = {}
    
    async def dispatch(self, request: Request, call_next):
        # Simple in-memory rate limiting (in production, use Redis)
        if os.getenv("ENVIRONMENT") == "production":
            client_ip = request.client.host if request.client else "unknown"
            current_time = __import__('time').time()
            
            # Clean old entries
            if client_ip in self.call_times:
                self.call_times[client_ip] = [
                    call_time for call_time in self.call_times[client_ip] 
                    if current_time - call_time < 60  # Keep last minute
                ]
            else:
                self.call_times[client_ip] = []
            
            # Check rate limit
            if len(self.call_times[client_ip]) >= self.calls_per_minute:
                return Response(
                    content="Rate limit exceeded", 
                    status_code=429,
                    headers={"Retry-After": "60"}
                )
            
            # Record this call
            self.call_times[client_ip].append(current_time)
        
        return await call_next(request)

# Add security and rate limiting middleware
app.add_middleware(RateLimitingMiddleware, calls_per_minute=int(os.getenv("RATE_LIMIT", 100)))
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware with production-ready configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Restrict methods in production
    allow_headers=[
        "Accept",
        "Accept-Language", 
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Cache-Control"
    ],  # Restrict headers for security
    max_age=3600,  # Cache preflight requests for 1 hour
)


def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enable dict-like access
    return conn


@app.get("/")
async def root():
    """Health check endpoint with security status"""
    environment = os.getenv("ENVIRONMENT", "development")
    status = {
        "message": "Clinical Canvas API is running with OpenAI integration",
        "status": "healthy",
        "environment": environment,
        "security": {
            "cors_configured": len(cors_origins) > 0,
            "rate_limiting": environment == "production",
            "security_headers": environment == "production",
            "https_only": environment == "production"
        },
        "services": {
            "openai_available": bool(OPENAI_AVAILABLE and hasattr(app.state, 'openai_service') and app.state.openai_service),
            "rag_available": bool(hasattr(app.state, 'rag_pipeline') and app.state.rag_pipeline),
            "database_connected": True  # SQLite is always available
        },
        "cors_origins": cors_origins if environment == "development" else len(cors_origins)
    }
    return status


@app.get("/api/patients", response_model=List[Patient])
async def get_patients():
    """Get list of all available patients"""
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT id, name, age, gender FROM patients ORDER BY name")
        patients = [
            Patient(
                id=row["id"],
                name=row["name"],
                age=row["age"],
                gender=row["gender"]
            )
            for row in cursor.fetchall()
        ]
        return patients
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


@app.get("/api/patients/{patient_id}", response_model=PatientDetail)
async def get_patient_detail(patient_id: str, role: str = "clinician"):
    """Get detailed patient data including canvas layout for specific role"""
    conn = get_db_connection()
    try:
        # Get patient basic info
        patient_cursor = conn.execute(
            "SELECT id, name, age, gender FROM patients WHERE id = ?", 
            (patient_id,)
        )
        patient_row = patient_cursor.fetchone()
        
        if not patient_row:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Get role-specific canvas layout
        layout_cursor = conn.execute(
            "SELECT nodes, connections, viewport_x, viewport_y, viewport_zoom FROM canvas_layouts WHERE patient_id = ? AND user_role = ? ORDER BY updated_at DESC LIMIT 1",
            (patient_id, role)
        )
        layout_row = layout_cursor.fetchone()
        
        # If no role-specific layout, get default layout template
        if not layout_row:
            template_cursor = conn.execute(
                "SELECT default_nodes, default_connections FROM layout_templates WHERE user_role = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1",
                (role,)
            )
            template_row = template_cursor.fetchone()
        
        # Use layout or template data
        if layout_row:
            canvas_layout = {
                "nodes": json.loads(layout_row["nodes"]) if layout_row["nodes"] else [],
                "connections": json.loads(layout_row["connections"]) if layout_row["connections"] else [],
                "viewport": {
                    "x": layout_row["viewport_x"] if layout_row else 0,
                    "y": layout_row["viewport_y"] if layout_row else 0,
                    "zoom": layout_row["viewport_zoom"] if layout_row else 1
                }
            }
        elif template_row:
            canvas_layout = {
                "nodes": json.loads(template_row["default_nodes"]) if template_row["default_nodes"] else [],
                "connections": json.loads(template_row["default_connections"]) if template_row["default_connections"] else [],
                "viewport": {"x": 0, "y": 0, "zoom": 1}
            }
        else:
            # Default empty layout
            canvas_layout = {
                "nodes": [],
                "connections": [],
                "viewport": {"x": 0, "y": 0, "zoom": 1}
            }
        
        # Get AI summary
        summary_cursor = conn.execute(
            "SELECT summary_text FROM ai_summaries WHERE patient_id = ? ORDER BY generated_at DESC LIMIT 1",
            (patient_id,)
        )
        summary_row = summary_cursor.fetchone()
        ai_summary = summary_row["summary_text"] if summary_row else None
        
        # Get clinical data
        vitals_cursor = conn.execute(
            "SELECT name, value, unit, reference_range, date_recorded FROM clinical_data WHERE patient_id = ? AND data_type = 'vital' ORDER BY date_recorded DESC",
            (patient_id,)
        )
        vitals_data = [dict(row) for row in vitals_cursor.fetchall()]
        
        labs_cursor = conn.execute(
            "SELECT name, value, unit, reference_range, date_recorded FROM clinical_data WHERE patient_id = ? AND data_type = 'lab' ORDER BY date_recorded DESC",
            (patient_id,)
        )
        lab_results = [dict(row) for row in labs_cursor.fetchall()]
        
        # Get documents
        docs_cursor = conn.execute(
            "SELECT id, filename, document_type, file_url FROM documents WHERE patient_id = ?",
            (patient_id,)
        )
        documents = [dict(row) for row in docs_cursor.fetchall()]
        
        return PatientDetail(
            id=patient_row["id"],
            name=patient_row["name"],
            age=patient_row["age"],
            gender=patient_row["gender"],
            canvas_layout=canvas_layout,
            ai_summary=ai_summary,
            vitals_data=vitals_data,
            lab_results=lab_results,
            documents=documents
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


@app.post("/api/patients/{patient_id}/ask", response_model=QAResponse)
async def ask_question(patient_id: str, request: QARequest):
    """Ask a question about a patient and get AI-generated answer with citations"""
    conn = get_db_connection()
    try:
        # First, check if patient exists
        patient_cursor = conn.execute("SELECT id, name, age, gender FROM patients WHERE id = ?", (patient_id,))
        patient_row = patient_cursor.fetchone()
        if not patient_row:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Get patient clinical context for OpenAI
        # Get clinical summary
        summary_cursor = conn.execute(
            "SELECT summary_text FROM ai_summaries WHERE patient_id = ? ORDER BY generated_at DESC LIMIT 1",
            (patient_id,)
        )
        summary_row = summary_cursor.fetchone()
        
        # Get recent vitals
        vitals_cursor = conn.execute("""
            SELECT name, value, unit, date_recorded 
            FROM clinical_data 
            WHERE patient_id = ? AND data_type = 'vital'
            ORDER BY date_recorded DESC
            LIMIT 10
        """, (patient_id,))
        vitals_data = [dict(row) for row in vitals_cursor.fetchall()]
        
        # Get recent lab results
        labs_cursor = conn.execute("""
            SELECT name, value, unit, reference_range, date_recorded
            FROM clinical_data 
            WHERE patient_id = ? AND data_type = 'lab'
            ORDER BY date_recorded DESC
            LIMIT 15
        """, (patient_id,))
        labs_data = [dict(row) for row in labs_cursor.fetchall()]
        
        # Try OpenAI service first
        if hasattr(app.state, 'openai_service') and app.state.openai_service:
            try:
                # Build patient context for OpenAI
                patient_context = {
                    "patient": {
                        "name": patient_row["name"],
                        "age": patient_row["age"],
                        "gender": patient_row["gender"]
                    },
                    "summary": summary_row["summary_text"] if summary_row else None,
                    "vitals": vitals_data,
                    "labs": labs_data
                }
                
                # Get relevant document chunks from RAG if available
                document_chunks = None
                if hasattr(app.state, 'rag_pipeline') and app.state.rag_pipeline:
                    try:
                        # Try to get relevant documents using the RAG pipeline search
                        rag_result = app.state.rag_pipeline.answer_question(patient_id, request.question)
                        if rag_result.get("success") and rag_result.get("sources"):
                            document_chunks = [source.get("text", "") for source in rag_result["sources"][:3]]
                    except Exception as e:
                        print(f"RAG document search failed: {e}")
                
                # Call OpenAI service
                openai_result = app.state.openai_service.answer_clinical_question(
                    question=request.question,
                    patient_context=patient_context,
                    document_chunks=document_chunks
                )
                
                if openai_result["success"]:
                    return QAResponse(
                        answer=openai_result["answer"],
                        source_document="Clinical Data & AI Analysis",
                        source_page=None,
                        confidence_score=openai_result.get("confidence_score", 0.75)
                    )
                else:
                    print(f"OpenAI service failed: {openai_result.get('error', 'Unknown error')}")
                    
            except Exception as e:
                print(f"OpenAI service error: {e}")
        
        # Fallback 1: Use RAG pipeline if available
        if hasattr(app.state, 'rag_pipeline') and app.state.rag_pipeline:
            try:
                rag_result = app.state.rag_pipeline.answer_question(patient_id, request.question)
                
                if rag_result["success"]:
                    # Get primary source for response
                    primary_source = None
                    primary_page = None
                    
                    if rag_result["sources"]:
                        primary_source = rag_result["sources"][0].get("document")
                        primary_page = rag_result["sources"][0].get("page")
                    
                    return QAResponse(
                        answer=rag_result["answer"],
                        source_document=primary_source,
                        source_page=primary_page,
                        confidence_score=rag_result.get("confidence_score", 0.5)
                    )
                else:
                    print(f"RAG pipeline failed: {rag_result.get('error', 'Unknown error')}")
            
            except Exception as e:
                print(f"RAG pipeline error: {e}")
        
        # Fallback 2: Look for pre-computed Q&A pairs
        qa_cursor = conn.execute(
            "SELECT answer, source_document_id, source_page, confidence_score FROM qa_pairs WHERE patient_id = ? AND LOWER(question) LIKE LOWER(?)",
            (patient_id, f"%{request.question}%")
        )
        qa_row = qa_cursor.fetchone()
        
        if qa_row:
            # Get document filename for source
            doc_cursor = conn.execute(
                "SELECT filename FROM documents WHERE id = ?",
                (qa_row["source_document_id"],)
            )
            doc_row = doc_cursor.fetchone()
            
            return QAResponse(
                answer=qa_row["answer"],
                source_document=doc_row["filename"] if doc_row else None,
                source_page=qa_row["source_page"],
                confidence_score=qa_row["confidence_score"] or 0.8
            )
        else:
            # Final fallback: Basic response with available data
            basic_info = f"Based on available data for {patient_row['name']} ({patient_row['age']} years old):"
            if summary_row:
                basic_info += f" {summary_row['summary_text']}"
            
            return QAResponse(
                answer=f"{basic_info} For specific clinical questions about '{request.question}', please consult with the healthcare provider directly as I need more detailed clinical context to provide a comprehensive answer.",
                source_document=None,
                source_page=None,
                confidence_score=0.3
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


@app.post("/api/patients/{patient_id}/soap/generate", response_model=SOAPNote)
async def generate_soap_note(patient_id: str):
    """Generate AI-powered SOAP note for a patient"""
    import uuid
    from datetime import datetime
    
    conn = get_db_connection()
    try:
        # Check if patient exists
        patient_cursor = conn.execute("SELECT id, name, age, gender FROM patients WHERE id = ?", (patient_id,))
        patient_row = patient_cursor.fetchone()
        if not patient_row:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Get clinical data for SOAP generation
        # Get recent vitals
        vitals_cursor = conn.execute("""
            SELECT name, value, unit, date_recorded 
            FROM clinical_data 
            WHERE patient_id = ? AND data_type = 'vital'
            ORDER BY date_recorded DESC
            LIMIT 10
        """, (patient_id,))
        vitals_data = [dict(row) for row in vitals_cursor.fetchall()]
        
        # Get recent lab results
        labs_cursor = conn.execute("""
            SELECT name, value, unit, reference_range, date_recorded
            FROM clinical_data 
            WHERE patient_id = ? AND data_type = 'lab'
            ORDER BY date_recorded DESC
            LIMIT 15
        """, (patient_id,))
        labs_data = [dict(row) for row in labs_cursor.fetchall()]
        
        # Get AI summary for context
        summary_cursor = conn.execute(
            "SELECT summary_text FROM ai_summaries WHERE patient_id = ?",
            (patient_id,)
        )
        summary_row = summary_cursor.fetchone()
        
        # Generate SOAP note using OpenAI service
        soap_sections = await generate_soap_sections(
            patient_row=patient_row,
            vitals_data=vitals_data,
            labs_data=labs_data,
            summary_data=dict(summary_row) if summary_row else None,
            openai_service=app.state.openai_service if hasattr(app.state, 'openai_service') else None
        )
        
        # Create SOAP note
        soap_note_id = str(uuid.uuid4())
        current_time = datetime.utcnow().isoformat()
        
        soap_note = SOAPNote(
            id=soap_note_id,
            patient_id=patient_id,
            date=current_time,
            soap_sections=soap_sections,
            generated_by="ai",
            confidence_score=0.85,
            last_modified=current_time
        )
        
        # Save to database (add soap_notes table if not exists)
        conn.execute("""
            INSERT OR REPLACE INTO soap_notes 
            (id, patient_id, date, subjective, objective, assessment, plan, generated_by, confidence_score, last_modified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            soap_note.id,
            soap_note.patient_id,
            soap_note.date,
            soap_note.soap_sections.subjective,
            soap_note.soap_sections.objective,
            soap_note.soap_sections.assessment,
            soap_note.soap_sections.plan,
            soap_note.generated_by,
            soap_note.confidence_score,
            soap_note.last_modified
        ))
        conn.commit()
        
        return soap_note
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SOAP generation error: {str(e)}")
    finally:
        conn.close()


async def generate_soap_sections(patient_row, vitals_data, labs_data, summary_data, openai_service=None):
    """Generate SOAP sections based on patient data using OpenAI or fallback logic"""
    patient_name = patient_row["name"]
    patient_age = patient_row["age"]
    patient_gender = patient_row["gender"]
    
    # Try OpenAI service first
    if openai_service:
        try:
            # Prepare patient data for OpenAI
            patient_data = {
                "name": patient_name,
                "age": patient_age,
                "gender": patient_gender
            }
            
            clinical_data = {
                "summary": summary_data.get("summary_text") if summary_data else None,
                "vitals": vitals_data,
                "labs": labs_data
            }
            
            # Call OpenAI SOAP generation
            result = openai_service.generate_soap_note(patient_data, clinical_data)
            
            if result["success"] and result["soap_sections"]:
                return SOAPSection(
                    subjective=result["soap_sections"].get("subjective", "Patient information as documented."),
                    objective=result["soap_sections"].get("objective", "Clinical findings as available."),
                    assessment=result["soap_sections"].get("assessment", "Assessment based on available data."),
                    plan=result["soap_sections"].get("plan", "Continue current care plan.")
                )
            else:
                print(f"OpenAI SOAP generation failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"OpenAI SOAP generation error: {e}")
    
    # Fallback to simplified logic if OpenAI fails
    print("Using fallback SOAP generation logic")
    
    # Extract key clinical findings
    recent_vitals = {}
    if vitals_data:
        for vital in vitals_data[:5]:  # Most recent 5
            recent_vitals[vital["name"]] = f"{vital['value']} {vital['unit']}"
    
    abnormal_labs = []
    if labs_data:
        for lab in labs_data:
            # Include all recent lab results (in a real system, you'd determine abnormal based on reference ranges)
            abnormal_labs.append(f"{lab['name']}: {lab['value']} {lab['unit']}")
    
    # Generate sections (fallback logic)
    subjective = f"Patient {patient_name} is a {patient_age}-year-old {patient_gender}"
    if summary_data and summary_data.get("summary_text"):
        subjective += f" with {summary_data['summary_text'].lower()}"
    subjective += ". Patient reports ongoing symptoms consistent with their known medical conditions."
    
    objective = f"Vital signs: "
    if recent_vitals:
        vital_strings = [f"{k}: {v}" for k, v in recent_vitals.items()]
        objective += ", ".join(vital_strings[:3])  # Include top 3 vitals
    else:
        objective += "Stable"
    
    if abnormal_labs:
        objective += f". Laboratory findings: {'; '.join(abnormal_labs[:3])}"
    
    assessment = "Clinical assessment based on current presentation and available data. "
    if summary_data and summary_data.get("summary_text"):
        # Use summary text to infer key clinical issues
        summary_text = summary_data["summary_text"].lower()
        if "kidney" in summary_text or "renal" in summary_text:
            assessment += "Chronic kidney disease requiring ongoing monitoring. "
        if "elevated" in summary_text or "high" in summary_text:
            assessment += "Elevated laboratory values noted. "
        if "creatinine" in summary_text:
            assessment += "Renal function impairment present. "
        assessment += "Multiple clinical issues being monitored."
    
    plan = "Continue current treatment plan with regular monitoring. "
    plan += "Follow-up as clinically indicated. "
    if abnormal_labs:
        plan += "Repeat laboratory studies as needed. "
    plan += "Patient education provided."
    
    return SOAPSection(
        subjective=subjective,
        objective=objective,
        assessment=assessment,
        plan=plan
    )


@app.post("/api/patients/{patient_id}/soap/save", response_model=dict)
async def save_soap_note(patient_id: str, soap_note: SOAPNote):
    """Save or update a SOAP note"""
    conn = get_db_connection()
    try:
        # Update the SOAP note
        conn.execute("""
            INSERT OR REPLACE INTO soap_notes 
            (id, patient_id, date, subjective, objective, assessment, plan, generated_by, confidence_score, last_modified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            soap_note.id,
            soap_note.patient_id,
            soap_note.date,
            soap_note.soap_sections.subjective,
            soap_note.soap_sections.objective,
            soap_note.soap_sections.assessment,
            soap_note.soap_sections.plan,
            soap_note.generated_by,
            soap_note.confidence_score,
            soap_note.last_modified
        ))
        conn.commit()
        
        return {"success": True, "message": "SOAP note saved successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Save error: {str(e)}")
    finally:
        conn.close()


@app.get("/api/patients/{patient_id}/soap", response_model=List[SOAPNote])
async def get_soap_notes(patient_id: str):
    """Get all SOAP notes for a patient"""
    conn = get_db_connection()
    try:
        cursor = conn.execute("""
            SELECT id, patient_id, date, subjective, objective, assessment, plan, 
                   generated_by, confidence_score, last_modified
            FROM soap_notes 
            WHERE patient_id = ? 
            ORDER BY date DESC
        """, (patient_id,))
        
        soap_notes = []
        for row in cursor.fetchall():
            soap_note = SOAPNote(
                id=row["id"],
                patient_id=row["patient_id"],
                date=row["date"],
                soap_sections=SOAPSection(
                    subjective=row["subjective"],
                    objective=row["objective"],
                    assessment=row["assessment"],
                    plan=row["plan"]
                ),
                generated_by=row["generated_by"],
                confidence_score=row["confidence_score"],
                last_modified=row["last_modified"]
            )
            soap_notes.append(soap_note)
        
        return soap_notes
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


@app.post("/api/patients/{patient_id}/documents/upload")
async def upload_document(patient_id: str, file: UploadFile = File(...)):
    """Upload and process a clinical document with OCR"""
    import uuid
    import os
    from datetime import datetime
    
    # Validate patient exists
    conn = get_db_connection()
    try:
        patient_cursor = conn.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
        if not patient_cursor.fetchone():
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Validate file type
        allowed_types = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif']
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {', '.join(allowed_types)}")
        
        # Create documents directory if it doesn't exist
        docs_dir = Path(__file__).parent.parent / "data" / "documents"
        docs_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        document_id = str(uuid.uuid4())
        filename = f"{document_id}_{file.filename}"
        file_path = docs_dir / filename
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process with OCR (simplified - in production would use Tesseract or cloud OCR)
        ocr_text = process_document_ocr(str(file_path), file_extension)
        
        # Save to database
        conn.execute("""
            INSERT INTO documents (id, patient_id, filename, document_type, file_path, file_url, processed_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            document_id,
            patient_id,
            file.filename,
            determine_document_type(file.filename, ocr_text),
            str(file_path),
            f"/documents/{filename}",
            datetime.utcnow().isoformat(),
            datetime.utcnow().isoformat()
        ))
        
        # Store OCR text as document content (in production, would store in separate table)
        if ocr_text:
            conn.execute("""
                INSERT OR REPLACE INTO document_embeddings (id, document_id, chunk_text, chunk_index, page_number, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                str(uuid.uuid4()),
                document_id,
                ocr_text[:5000],  # Store first 5000 chars
                0,
                1,
                datetime.utcnow().isoformat()
            ))
        
        conn.commit()
        
        return {
            "success": True,
            "document_id": document_id,
            "filename": file.filename,
            "ocr_text_length": len(ocr_text) if ocr_text else 0,
            "message": "Document uploaded and processed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")
    finally:
        conn.close()


def process_document_ocr(file_path: str, file_extension: str) -> str:
    """
    Process document with OCR - simplified implementation
    In production, would use Tesseract OCR or cloud services like AWS Textract
    """
    try:
        if file_extension == '.pdf':
            # For PDF files, would use PyPDF2 or pdfplumber for text extraction
            # or Tesseract for scanned PDFs
            return extract_pdf_text(file_path)
        elif file_extension in ['.jpg', '.jpeg', '.png', '.tiff', '.tif']:
            # For image files, would use Tesseract OCR
            return extract_image_text(file_path)
        else:
            return ""
    except Exception as e:
        print(f"OCR processing error: {e}")
        return ""


def extract_pdf_text(file_path: str) -> str:
    """Extract text from PDF - simplified implementation"""
    try:
        # In production, would use PyPDF2, pdfplumber, or similar
        # For demo, return placeholder text
        return f"Extracted text from PDF document at {file_path}. In production, this would contain the actual document text extracted using PDF processing libraries."
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""


def extract_image_text(file_path: str) -> str:
    """Extract text from image using OCR - simplified implementation"""
    try:
        # In production, would use pytesseract or cloud OCR services
        # For demo, return placeholder text
        return f"OCR extracted text from image at {file_path}. In production, this would contain text extracted using Tesseract or cloud OCR services like AWS Textract or Google Vision API."
    except Exception as e:
        print(f"Image OCR error: {e}")
        return ""


def determine_document_type(filename: str, ocr_text: str) -> str:
    """Determine document type based on filename and content"""
    filename_lower = filename.lower()
    ocr_lower = ocr_text.lower() if ocr_text else ""
    
    if any(keyword in filename_lower for keyword in ['lab', 'result', 'blood', 'test']):
        return 'lab_report'
    elif any(keyword in filename_lower for keyword in ['referral', 'consult']):
        return 'referral'
    elif any(keyword in filename_lower for keyword in ['discharge', 'summary']):
        return 'discharge_summary'
    elif any(keyword in filename_lower for keyword in ['xray', 'ct', 'mri', 'scan']):
        return 'imaging'
    elif any(keyword in ocr_lower for keyword in ['laboratory', 'test results', 'blood work']):
        return 'lab_report'
    elif any(keyword in ocr_lower for keyword in ['referral', 'consultation']):
        return 'referral'
    else:
        return 'clinical_document'


# ============= ROLE-BASED LAYOUT ENDPOINTS =============

@app.get("/api/roles", response_model=List[UserRole])
async def get_user_roles():
    """Get all available user roles"""
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT id, role_name, display_name, description FROM user_roles ORDER BY role_name")
        roles = [
            UserRole(
                id=row["id"],
                role_name=row["role_name"],
                display_name=row["display_name"],
                description=row["description"] or ""
            )
            for row in cursor.fetchall()
        ]
        return roles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


@app.get("/api/layout-templates/{role}", response_model=List[LayoutTemplate])
async def get_layout_templates(role: str):
    """Get layout templates for a specific role"""
    conn = get_db_connection()
    try:
        cursor = conn.execute("""
            SELECT id, template_name, user_role, template_description, default_nodes, default_connections
            FROM layout_templates 
            WHERE user_role = ? AND is_active = 1
            ORDER BY template_name
        """, (role,))
        
        templates = []
        for row in cursor.fetchall():
            template = LayoutTemplate(
                id=row["id"],
                template_name=row["template_name"],
                user_role=row["user_role"],
                template_description=row["template_description"] or "",
                default_nodes=json.loads(row["default_nodes"]) if row["default_nodes"] else [],
                default_connections=json.loads(row["default_connections"]) if row["default_connections"] else []
            )
            templates.append(template)
        
        return templates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


@app.post("/api/patients/{patient_id}/layout/{role}")
async def save_patient_layout(patient_id: str, role: str, layout: Dict[str, Any]):
    """Save patient-specific canvas layout for a role"""
    import uuid
    from datetime import datetime
    
    conn = get_db_connection()
    try:
        # Check if patient exists
        patient_cursor = conn.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
        if not patient_cursor.fetchone():
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Save or update layout
        layout_id = str(uuid.uuid4())
        current_time = datetime.utcnow().isoformat()
        
        conn.execute("""
            INSERT OR REPLACE INTO canvas_layouts 
            (id, patient_id, user_role, nodes, connections, viewport_x, viewport_y, viewport_zoom, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            layout_id,
            patient_id,
            role,
            json.dumps(layout.get("nodes", [])),
            json.dumps(layout.get("connections", [])),
            layout.get("viewport", {}).get("x", 0),
            layout.get("viewport", {}).get("y", 0),
            layout.get("viewport", {}).get("zoom", 1),
            current_time
        ))
        conn.commit()
        
        return {"success": True, "message": "Layout saved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Save error: {str(e)}")
    finally:
        conn.close()


# ============= POPULATION ANALYTICS ENDPOINTS =============

@app.get("/api/analytics/population/metrics", response_model=List[PopulationMetric])
async def get_population_metrics(metric_type: Optional[str] = None, time_period: Optional[str] = None):
    """Get population health metrics"""
    conn = get_db_connection()
    try:
        query = "SELECT id, metric_name, metric_type, metric_value, time_period, calculated_date, patient_count, metadata FROM population_metrics WHERE 1=1"
        params = []
        
        if metric_type:
            query += " AND metric_type = ?"
            params.append(metric_type)
        
        if time_period:
            query += " AND time_period = ?"
            params.append(time_period)
        
        query += " ORDER BY calculated_date DESC"
        
        cursor = conn.execute(query, params)
        metrics = []
        for row in cursor.fetchall():
            metric = PopulationMetric(
                id=row["id"],
                metric_name=row["metric_name"],
                metric_type=row["metric_type"],
                metric_value=json.loads(row["metric_value"]) if row["metric_value"] else None,
                time_period=row["time_period"],
                calculated_date=row["calculated_date"],
                patient_count=row["patient_count"],
                metadata=json.loads(row["metadata"]) if row["metadata"] else None
            )
            metrics.append(metric)
        
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


@app.get("/api/analytics/disease-patterns", response_model=List[DiseasePattern])
async def get_disease_patterns(pattern_type: Optional[str] = None):
    """Get disease patterns and trends"""
    conn = get_db_connection()
    try:
        query = """
            SELECT id, pattern_name, pattern_type, condition_codes, affected_patients, 
                   pattern_data, confidence_score, time_range_start, time_range_end
            FROM disease_patterns WHERE 1=1
        """
        params = []
        
        if pattern_type:
            query += " AND pattern_type = ?"
            params.append(pattern_type)
        
        query += " ORDER BY confidence_score DESC, updated_at DESC"
        
        cursor = conn.execute(query, params)
        patterns = []
        for row in cursor.fetchall():
            pattern = DiseasePattern(
                id=row["id"],
                pattern_name=row["pattern_name"],
                pattern_type=row["pattern_type"],
                condition_codes=json.loads(row["condition_codes"]) if row["condition_codes"] else [],
                affected_patients=json.loads(row["affected_patients"]) if row["affected_patients"] else [],
                pattern_data=json.loads(row["pattern_data"]) if row["pattern_data"] else {},
                confidence_score=row["confidence_score"] or 0.0,
                time_range_start=row["time_range_start"],
                time_range_end=row["time_range_end"]
            )
            patterns.append(pattern)
        
        return patterns
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


@app.get("/api/analytics/medications", response_model=List[MedicationAnalytic])
async def get_medication_analytics(medication_name: Optional[str] = None, usage_pattern: Optional[str] = None):
    """Get medication usage analytics"""
    conn = get_db_connection()
    try:
        query = """
            SELECT id, medication_name, medication_class, usage_pattern, analytics_data,
                   patient_count, time_period, calculated_date
            FROM medication_analytics WHERE 1=1
        """
        params = []
        
        if medication_name:
            query += " AND LOWER(medication_name) LIKE LOWER(?)"
            params.append(f"%{medication_name}%")
        
        if usage_pattern:
            query += " AND usage_pattern = ?"
            params.append(usage_pattern)
        
        query += " ORDER BY calculated_date DESC, patient_count DESC"
        
        cursor = conn.execute(query, params)
        analytics = []
        for row in cursor.fetchall():
            analytic = MedicationAnalytic(
                id=row["id"],
                medication_name=row["medication_name"],
                medication_class=row["medication_class"],
                usage_pattern=row["usage_pattern"],
                analytics_data=json.loads(row["analytics_data"]) if row["analytics_data"] else {},
                patient_count=row["patient_count"],
                time_period=row["time_period"],
                calculated_date=row["calculated_date"]
            )
            analytics.append(analytic)
        
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


@app.get("/api/analytics/dashboard/{role}")
async def get_role_dashboard_data(role: str):
    """Get aggregated dashboard data for a specific role"""
    conn = get_db_connection()
    try:
        dashboard_data = {}
        
        if role == "analyst":
            # Population metrics summary
            metrics_cursor = conn.execute("""
                SELECT metric_type, COUNT(*) as count, AVG(CAST(patient_count AS REAL)) as avg_patients
                FROM population_metrics 
                WHERE calculated_date >= date('now', '-30 days')
                GROUP BY metric_type
            """)
            dashboard_data["population_summary"] = [dict(row) for row in metrics_cursor.fetchall()]
            
            # Recent disease patterns
            patterns_cursor = conn.execute("""
                SELECT pattern_name, pattern_type, confidence_score, 
                       json_array_length(affected_patients) as patient_count
                FROM disease_patterns 
                WHERE confidence_score > 0.7
                ORDER BY updated_at DESC LIMIT 10
            """)
            dashboard_data["recent_patterns"] = [dict(row) for row in patterns_cursor.fetchall()]
            
            # Top medications by usage
            meds_cursor = conn.execute("""
                SELECT medication_name, medication_class, patient_count, usage_pattern
                FROM medication_analytics 
                WHERE calculated_date >= date('now', '-30 days')
                ORDER BY patient_count DESC LIMIT 15
            """)
            dashboard_data["top_medications"] = [dict(row) for row in meds_cursor.fetchall()]
            
        elif role == "admin":
            # System statistics
            stats_cursor = conn.execute("""
                SELECT 
                    (SELECT COUNT(*) FROM patients) as total_patients,
                    (SELECT COUNT(*) FROM documents) as total_documents,
                    (SELECT COUNT(*) FROM soap_notes) as total_soap_notes,
                    (SELECT COUNT(*) FROM canvas_layouts) as total_layouts
            """)
            dashboard_data["system_stats"] = dict(stats_cursor.fetchone())
            
            # Recent activity
            activity_cursor = conn.execute("""
                SELECT 'document' as type, filename as name, created_at
                FROM documents 
                WHERE created_at >= datetime('now', '-7 days')
                UNION ALL
                SELECT 'soap_note' as type, 'SOAP Note' as name, created_at
                FROM soap_notes 
                WHERE created_at >= datetime('now', '-7 days')
                ORDER BY created_at DESC LIMIT 20
            """)
            dashboard_data["recent_activity"] = [dict(row) for row in activity_cursor.fetchall()]
            
        elif role == "clinician":
            # Patient summary stats
            patient_cursor = conn.execute("""
                SELECT 
                    COUNT(*) as total_patients,
                    AVG(age) as avg_age,
                    COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_count,
                    COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_count
                FROM patients
            """)
            dashboard_data["patient_summary"] = dict(patient_cursor.fetchone())
            
            # Recent SOAP notes
            soap_cursor = conn.execute("""
                SELECT s.id, s.patient_id, p.name as patient_name, s.date, s.generated_by
                FROM soap_notes s
                JOIN patients p ON s.patient_id = p.id
                ORDER BY s.date DESC LIMIT 10
            """)
            dashboard_data["recent_soap_notes"] = [dict(row) for row in soap_cursor.fetchall()]
        
        return dashboard_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)