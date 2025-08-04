"""
AI-Powered Clinical Canvas Backend
FastAPI application for serving patient data and AI Q&A
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sqlite3
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os
import sys
from pathlib import Path

# Add ai-pipeline to path for imports
sys.path.append(str(Path(__file__).parent.parent / "ai-pipeline"))

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


# Database initialization
def init_database():
    """Initialize SQLite database with schema"""
    # Ensure data directory exists
    os.makedirs(DB_PATH.parent, exist_ok=True)
    
    # Read schema file
    schema_path = Path(__file__).parent.parent / "data" / "schemas" / "database_schema.sql"
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
    
    # Initialize RAG pipeline
    try:
        from rag_pipeline import RAGPipeline
        app.state.rag_pipeline = RAGPipeline(str(DB_PATH), use_ollama=True)
        print("RAG pipeline initialized successfully")
    except Exception as e:
        print(f"Warning: RAG pipeline initialization failed: {e}")
        app.state.rag_pipeline = None
    
    yield
    # Shutdown: cleanup if needed


# FastAPI app
app = FastAPI(
    title="Clinical Canvas API",
    description="Backend API for AI-Powered Clinical Canvas",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174","http://localhost:5173", "http://localhost:3000"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enable dict-like access
    return conn


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Clinical Canvas API is running", "status": "healthy"}


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
async def get_patient_detail(patient_id: str):
    """Get detailed patient data including canvas layout"""
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
        
        # Get canvas layout
        layout_cursor = conn.execute(
            "SELECT nodes, connections, viewport_x, viewport_y, viewport_zoom FROM canvas_layouts WHERE patient_id = ? ORDER BY updated_at DESC LIMIT 1",
            (patient_id,)
        )
        layout_row = layout_cursor.fetchone()
        
        canvas_layout = {
            "nodes": json.loads(layout_row["nodes"]) if layout_row and layout_row["nodes"] else [],
            "connections": json.loads(layout_row["connections"]) if layout_row and layout_row["connections"] else [],
            "viewport": {
                "x": layout_row["viewport_x"] if layout_row else 0,
                "y": layout_row["viewport_y"] if layout_row else 0,
                "zoom": layout_row["viewport_zoom"] if layout_row else 1
            }
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
        patient_cursor = conn.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
        if not patient_cursor.fetchone():
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Use RAG pipeline if available
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
                    # RAG failed, fall back to basic lookup
                    print(f"RAG pipeline failed: {rag_result.get('error', 'Unknown error')}")
            
            except Exception as e:
                print(f"RAG pipeline error: {e}")
        
        # Fallback: Look for pre-computed Q&A pairs
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
            # Final fallback: Basic response
            return QAResponse(
                answer=f"I apologize, but I don't have a specific answer for '{request.question}' about this patient yet. The AI pipeline is being processed. Please try again in a moment or contact your healthcare provider for specific medical questions.",
                source_document=None,
                source_page=None,
                confidence_score=0.1
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
        
        # Generate SOAP note using AI (simplified version for demo)
        # In a production system, this would use the RAG pipeline or a dedicated SOAP generation model
        soap_sections = generate_soap_sections(
            patient_row=patient_row,
            vitals_data=vitals_data,
            labs_data=labs_data,
            summary_data=dict(summary_row) if summary_row else None
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


def generate_soap_sections(patient_row, vitals_data, labs_data, summary_data):
    """Generate SOAP sections based on patient data (simplified AI simulation)"""
    patient_name = patient_row["name"]
    patient_age = patient_row["age"]
    patient_gender = patient_row["gender"]
    
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
    
    # Generate sections (this would typically use an LLM)
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)