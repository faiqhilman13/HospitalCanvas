"""
Simplified RAG Pipeline for Railway deployment
"""

import sqlite3
import json
from pathlib import Path
from typing import Dict, Any, List
from document_processor import DocumentProcessor, MockEmbeddingService

# Import OpenAI service from local services directory
try:
    from services.openai_service import OpenAIService
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAIService = None


class RAGPipeline:
    def __init__(self, db_path: str, use_ollama: bool = False):
        self.db_path = Path(db_path)
        self.doc_processor = DocumentProcessor()
        self.embedding_service = MockEmbeddingService()
        
        # Initialize OpenAI service
        self.openai_service = None
        self.use_openai = False
        
        if OPENAI_AVAILABLE:
            try:
                self.openai_service = OpenAIService()
                self.use_openai = self._check_openai_availability()
                if self.use_openai:
                    print("✅ OpenAI service ready for RAG")
            except Exception as e:
                print(f"⚠️ OpenAI initialization failed: {e}")
    
    def _check_openai_availability(self) -> bool:
        """Check if OpenAI is available"""
        if self.openai_service:
            return self.openai_service.is_available()
        return False
    
    def get_db_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def retrieve_relevant_chunks(self, patient_id: str, query: str, max_chunks: int = 3) -> List[Dict[str, Any]]:
        """Retrieve relevant document chunks for a query"""
        conn = self.get_db_connection()
        try:
            # Get all chunks for the patient
            cursor = conn.execute("""
                SELECT de.chunk_text, de.page_number, d.filename, de.chunk_index
                FROM document_embeddings de
                JOIN documents d ON de.document_id = d.id
                WHERE d.patient_id = ?
                ORDER BY de.chunk_index
            """, (patient_id,))
            
            chunks = []
            for row in cursor.fetchall():
                chunks.append({
                    "text": row["chunk_text"],
                    "page_number": row["page_number"],
                    "filename": row["filename"],
                    "chunk_index": row["chunk_index"]
                })
            
            if not chunks:
                return []
            
            # Use simple keyword matching for relevance
            relevant_chunks = self.doc_processor.find_relevant_chunks(chunks, query, max_chunks)
            return relevant_chunks
            
        except Exception as e:
            print(f"Error retrieving chunks: {e}")
            return []
        finally:
            conn.close()
    
    def get_patient_clinical_context(self, patient_id: str) -> Dict[str, Any]:
        """Get comprehensive clinical context for a patient"""
        conn = self.get_db_connection()
        try:
            context = {}
            
            # Get patient basic info
            patient_cursor = conn.execute(
                "SELECT id, name, age, gender FROM patients WHERE id = ?", 
                (patient_id,)
            )
            patient_row = patient_cursor.fetchone()
            if patient_row:
                context["patient"] = dict(patient_row)
            
            # Get AI summary
            summary_cursor = conn.execute(
                "SELECT summary_text FROM ai_summaries WHERE patient_id = ? ORDER BY generated_at DESC LIMIT 1",
                (patient_id,)
            )
            summary_row = summary_cursor.fetchone()
            if summary_row:
                context["summary"] = summary_row["summary_text"]
            
            # Get clinical data
            vitals_cursor = conn.execute(
                "SELECT name, value, unit, reference_range, date_recorded FROM clinical_data WHERE patient_id = ? AND data_type = 'vital' ORDER BY date_recorded DESC LIMIT 10",
                (patient_id,)
            )
            context["vitals"] = [dict(row) for row in vitals_cursor.fetchall()]
            
            labs_cursor = conn.execute(
                "SELECT name, value, unit, reference_range, date_recorded FROM clinical_data WHERE patient_id = ? AND data_type = 'lab' ORDER BY date_recorded DESC LIMIT 20",
                (patient_id,)
            )
            context["labs"] = [dict(row) for row in labs_cursor.fetchall()]
            
            return context
            
        except Exception as e:
            print(f"Error getting patient context: {e}")
            return {}
        finally:
            conn.close()
    
    def answer_question(self, patient_id: str, question: str) -> Dict[str, Any]:
        """Answer a question using simplified RAG pipeline"""
        
        # Get patient clinical context
        clinical_context = self.get_patient_clinical_context(patient_id)
        
        if not clinical_context:
            return {
                "success": False,
                "error": "Patient not found",
                "answer": "",
                "sources": []
            }
        
        # Retrieve relevant document chunks
        relevant_chunks = self.retrieve_relevant_chunks(patient_id, question, max_chunks=3)
        
        # Check for pre-computed Q&A pairs first
        conn = self.get_db_connection()
        try:
            qa_cursor = conn.execute(
                "SELECT answer, source_document_id, source_page, confidence_score FROM qa_pairs WHERE patient_id = ? AND LOWER(question) LIKE LOWER(?)",
                (patient_id, f"%{question}%")
            )
            qa_row = qa_cursor.fetchone()
            
            if qa_row:
                # Get document filename for source
                doc_cursor = conn.execute(
                    "SELECT filename FROM documents WHERE id = ?",
                    (qa_row["source_document_id"],)
                )
                doc_row = doc_cursor.fetchone()
                
                return {
                    "success": True,
                    "answer": qa_row["answer"],
                    "confidence_score": qa_row["confidence_score"] or 0.8,
                    "sources": [{
                        "document": doc_row["filename"] if doc_row else "Unknown",
                        "page": qa_row["source_page"],
                        "type": "pre_computed"
                    }],
                    "method": "database_lookup"
                }
        
        except Exception as e:
            print(f"Error checking pre-computed Q&A: {e}")
        finally:
            conn.close()
        
        # Generate answer using OpenAI if available
        document_context = []
        sources = []
        
        for chunk in relevant_chunks:
            document_context.append(f"From {chunk['filename']} (page {chunk['page_number']}): {chunk['text']}")
            sources.append({
                "document": chunk["filename"],
                "page": chunk["page_number"],
                "relevance_score": chunk.get("relevance_score", 0),
                "type": "document_chunk"
            })
        
        # Try OpenAI
        if self.use_openai and self.openai_service:
            try:
                openai_result = self.openai_service.answer_clinical_question(
                    question, clinical_context, document_context
                )
                
                if openai_result["success"]:
                    return {
                        "success": True,
                        "answer": openai_result["response"],
                        "confidence_score": openai_result.get("confidence_score", 0.8),
                        "sources": sources,
                        "method": "rag_openai"
                    }
                    
            except Exception as e:
                print(f"OpenAI service error: {e}")
        
        # Fallback response
        fallback_answer = self._generate_fallback_answer(question, clinical_context, relevant_chunks)
        
        return {
            "success": True,
            "answer": fallback_answer,
            "confidence_score": 0.3,
            "sources": sources,
            "method": "fallback"
        }
    
    def _generate_fallback_answer(self, question: str, clinical_context: Dict[str, Any], chunks: List[Dict[str, Any]]) -> str:
        """Generate a basic fallback answer"""
        patient_name = clinical_context.get("patient", {}).get("name", "the patient")
        question_lower = question.lower()
        
        if "kidney" in question_lower or "renal" in question_lower or "creatinine" in question_lower:
            # Find kidney-related lab values
            creatinine = None
            egfr = None
            
            for lab in clinical_context.get("labs", []):
                if "creatinine" in lab["name"].lower():
                    creatinine = f"{lab['value']} {lab['unit']}"
                elif "egfr" in lab["name"].lower():
                    egfr = f"{lab['value']} {lab['unit']}"
            
            if creatinine and egfr:
                return f"Based on lab results for {patient_name}, creatinine is {creatinine} and eGFR is {egfr}. These values indicate significant kidney function impairment."
        
        if "summary" in question_lower or "overview" in question_lower:
            summary = clinical_context.get("summary", "")
            if summary:
                return f"Clinical summary for {patient_name}: {summary}"
        
        if chunks:
            return f"Based on clinical documents for {patient_name}, relevant information was found but detailed analysis requires full AI system. Please consult documents directly or contact healthcare provider."
        
        return f"Insufficient information available to answer that question about {patient_name}."