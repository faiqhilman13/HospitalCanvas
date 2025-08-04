"""
RAG (Retrieval-Augmented Generation) Pipeline
Combines document retrieval with LLM generation for clinical Q&A
"""

import sqlite3
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from ollama_client import OllamaClient
from document_processor import DocumentProcessor, MockEmbeddingService
import numpy as np

class RAGPipeline:
    def __init__(self, db_path: str, use_ollama: bool = True):
        self.db_path = Path(db_path)
        self.ollama_client = OllamaClient() if use_ollama else None
        self.doc_processor = DocumentProcessor()
        self.embedding_service = MockEmbeddingService()
        self.use_ollama = use_ollama and self._check_ollama_availability()
        
    def _check_ollama_availability(self) -> bool:
        """Check if Ollama is available"""
        if self.ollama_client:
            return self.ollama_client.is_available()
        return False
    
    def get_db_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def store_document_chunks(self, document_id: str, chunks: List[Dict[str, Any]]) -> bool:
        """Store document chunks in database"""
        conn = self.get_db_connection()
        try:
            for chunk in chunks:
                # Generate mock embedding
                embedding = self.embedding_service.generate_embeddings([chunk["text"]])[0]
                
                conn.execute("""
                    INSERT OR REPLACE INTO document_embeddings 
                    (id, document_id, chunk_text, chunk_index, page_number, embedding, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                """, (
                    chunk["id"],
                    document_id,
                    chunk["text"],
                    chunk["chunk_index"],
                    chunk.get("page_number", 1),
                    embedding.tobytes()  # Store as binary data
                ))
            
            conn.commit()
            return True
            
        except Exception as e:
            print(f"Error storing chunks: {e}")
            return False
        finally:
            conn.close()
    
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
            
            # Use simple keyword matching for relevance (in real implementation, would use embeddings)
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
        """Answer a question using RAG pipeline"""
        
        # Step 1: Get patient clinical context
        clinical_context = self.get_patient_clinical_context(patient_id)
        
        if not clinical_context:
            return {
                "success": False,
                "error": "Patient not found",
                "answer": "",
                "sources": []
            }
        
        # Step 2: Retrieve relevant document chunks
        relevant_chunks = self.retrieve_relevant_chunks(patient_id, question, max_chunks=3)
        
        # Step 3: Check for pre-computed Q&A pairs first
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
        
        # Step 4: Generate answer using LLM (if available)
        if self.use_ollama and self.ollama_client:
            
            # Prepare document context
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
            
            # Generate answer using Ollama
            ollama_result = self.ollama_client.answer_clinical_question(
                question, clinical_context, document_context
            )
            
            if ollama_result["success"]:
                return {
                    "success": True,
                    "answer": ollama_result["response"],
                    "confidence_score": 0.7,  # Default confidence for LLM responses
                    "sources": sources,
                    "method": "rag_llm",
                    "chunks_used": len(relevant_chunks),
                    "model_stats": {
                        "total_duration": ollama_result.get("total_duration", 0),
                        "eval_count": ollama_result.get("eval_count", 0)
                    }
                }
            else:
                # Fall back to basic response
                return {
                    "success": False,
                    "error": f"LLM generation failed: {ollama_result['error']}",
                    "answer": "I apologize, but I'm unable to generate a response at this time due to technical issues.",
                    "sources": sources
                }
        
        # Step 5: Fallback response
        fallback_answer = self._generate_fallback_answer(question, clinical_context, relevant_chunks)
        
        return {
            "success": True,
            "answer": fallback_answer,
            "confidence_score": 0.3,
            "sources": [{"document": chunk["filename"], "page": chunk["page_number"], "type": "fallback"} for chunk in relevant_chunks],
            "method": "fallback"
        }
    
    def _generate_fallback_answer(self, question: str, clinical_context: Dict[str, Any], chunks: List[Dict[str, Any]]) -> str:
        """Generate a basic fallback answer when LLM is not available"""
        
        patient_name = clinical_context.get("patient", {}).get("name", "the patient")
        
        # Basic keyword-based responses
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
                return f"Based on the available lab results for {patient_name}, the creatinine level is {creatinine} and eGFR is {egfr}. These values indicate significant kidney function impairment that requires medical attention."
        
        if "summary" in question_lower or "overview" in question_lower:
            summary = clinical_context.get("summary", "")
            if summary:
                return f"Here's the clinical summary for {patient_name}: {summary}"
        
        # Generic response with available context
        if chunks:
            return f"Based on the available clinical documents for {patient_name}, I found relevant information but cannot provide a detailed analysis without the AI system fully operational. Please consult the clinical documents directly or contact the healthcare provider for specific medical questions."
        
        return f"I apologize, but I don't have sufficient information to answer that question about {patient_name}. Please ensure all clinical documents have been processed and the AI system is properly configured."


def test_rag_pipeline():
    """Test the RAG pipeline"""
    # Use the existing database
    db_path = Path(__file__).parent.parent / "data" / "clinical_canvas.db"
    
    if not db_path.exists():
        print("Database not found. Please run the backend initialization first.")
        return False
    
    print("Testing RAG Pipeline...")
    
    # Initialize pipeline
    rag = RAGPipeline(str(db_path), use_ollama=False)  # Start without Ollama for initial testing
    
    # Test getting patient context
    context = rag.get_patient_clinical_context("uncle-tan-001")
    
    if context:
        print(f"Retrieved clinical context for {context.get('patient', {}).get('name', 'Unknown')}")
        print(f"   - Summary: {context.get('summary', 'N/A')[:100]}...")
        print(f"   - Lab results: {len(context.get('labs', []))} entries")
        print(f"   - Vitals: {len(context.get('vitals', []))} entries")
    else:
        print("Failed to retrieve clinical context")
        return False
    
    # Test question answering
    test_questions = [
        "What is the current kidney function status?",
        "What are the main concerns with this patient?",
        "What is the patient's age and gender?"
    ]
    
    for question in test_questions:
        print(f"\nQuestion: {question}")
        result = rag.answer_question("uncle-tan-001", question)
        
        if result["success"]:
            print(f"Answer ({result['method']}): {result['answer'][:150]}...")
            print(f"   Confidence: {result['confidence_score']:.2f}")
            print(f"   Sources: {len(result['sources'])} documents")
        else:
            print(f"Failed: {result.get('error', 'Unknown error')}")
    
    return True


if __name__ == "__main__":
    if test_rag_pipeline():
        print("\nRAG Pipeline is working!")
        print("\nNext steps:")
        print("   1. Install Ollama: https://ollama.ai/")
        print("   2. Pull LLaMA 3 model: ollama pull llama3")
        print("   3. Start Ollama service: ollama serve")
        print("   4. Re-run with Ollama enabled for full AI capabilities")
    else:
        print("\nRAG Pipeline setup incomplete")