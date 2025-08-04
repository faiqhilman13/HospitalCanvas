"""
AI-Powered Clinical Canvas Backend
FastAPI application for serving patient data and AI Q&A
"""

from fastapi import FastAPI, HTTPException, Depends
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
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default ports
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)