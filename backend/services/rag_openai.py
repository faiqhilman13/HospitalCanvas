"""
RAG Pipeline with OpenAI Integration
Enhanced RAG pipeline that can use OpenAI as an alternative to Ollama
"""

import sqlite3
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import sys
import os

# Add ai-pipeline to path for imports
current_dir = Path(__file__).parent
ai_pipeline_path = current_dir.parent.parent / "ai-pipeline"
sys.path.append(str(ai_pipeline_path))

from document_processor import DocumentProcessor, MockEmbeddingService
from .openai_service import OpenAIService, create_openai_service

class RAGPipelineOpenAI:
    """
    Enhanced RAG Pipeline with OpenAI integration
    Supports both OpenAI and Ollama backends for flexible deployment
    """
    
    def __init__(self, db_path: str, use_openai: bool = True, openai_model: str = "gpt-4"):
        self.db_path = Path(db_path)
        self.use_openai = use_openai
        self.openai_model = openai_model
        
        # Initialize services
        if use_openai:
            try:
                self.openai_service = create_openai_service(model=openai_model)
                self.openai_available = self.openai_service.is_available()
            except Exception as e:
                print(f"OpenAI initialization failed: {e}")
                self.openai_service = None
                self.openai_available = False
        else:
            self.openai_service = None
            self.openai_available = False
            
        # Document processing components
        self.doc_processor = DocumentProcessor()
        self.embedding_service = MockEmbeddingService()
        
        # Fallback to Ollama if needed
        if not self.openai_available and use_openai:
            try:
                from ollama_client import OllamaClient
                self.ollama_client = OllamaClient()
                self.ollama_available = self.ollama_client.is_available()
                print("OpenAI not available, falling back to Ollama")
            except ImportError:
                self.ollama_client = None
                self.ollama_available = False
                print("Neither OpenAI nor Ollama available")
        elif not use_openai:
            try:
                from ollama_client import OllamaClient
                self.ollama_client = OllamaClient()
                self.ollama_available = self.ollama_client.is_available()
            except ImportError:
                self.ollama_client = None
                self.ollama_available = False
        else:
            self.ollama_client = None
            self.ollama_available = False

    def get_db_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def store_document_chunks(self, document_id: str, chunks: List[Dict[str, Any]]) -> bool:
        """Store document chunks in database with embeddings"""
        conn = self.get_db_connection()
        try:
            for chunk in chunks:
                # Generate embedding
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
                    embedding.tobytes()
                ))
            
            conn.commit()
            return True
            
        except Exception as e:
            print(f"Error storing chunks: {e}")
            return False
        finally:
            conn.close()

    def retrieve_relevant_chunks(self, patient_id: str, query: str, max_chunks: int = 5) -> List[Dict[str, Any]]:
        """Retrieve relevant document chunks for a query"""
        conn = self.get_db_connection()
        try:
            # Get all chunks for the patient
            cursor = conn.execute("""
                SELECT de.chunk_text, de.page_number, d.filename, de.chunk_index, d.document_type
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
                    "chunk_index": row["chunk_index"],
                    "document_type": row["document_type"] if row["document_type"] else "unknown"
                })
            
            if not chunks:
                return []
            
            # Use document processor for relevance scoring
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
            vitals_cursor = conn.execute("""
                SELECT name, value, unit, reference_range, date_recorded 
                FROM clinical_data 
                WHERE patient_id = ? AND data_type = 'vital' 
                ORDER BY date_recorded DESC 
                LIMIT 15
            """, (patient_id,))
            context["vitals"] = [dict(row) for row in vitals_cursor.fetchall()]
            
            labs_cursor = conn.execute("""
                SELECT name, value, unit, reference_range, date_recorded 
                FROM clinical_data 
                WHERE patient_id = ? AND data_type = 'lab' 
                ORDER BY date_recorded DESC 
                LIMIT 25
            """, (patient_id,))
            context["labs"] = [dict(row) for row in labs_cursor.fetchall()]
            
            return context
            
        except Exception as e:
            print(f"Error getting patient context: {e}")
            return {}
        finally:
            conn.close()

    def answer_question(self, patient_id: str, question: str) -> Dict[str, Any]:
        """Answer a question using RAG pipeline with OpenAI or Ollama"""
        
        # Step 1: Get patient clinical context
        clinical_context = self.get_patient_clinical_context(patient_id)
        
        if not clinical_context:
            return {
                "success": False,
                "error": "Patient not found",
                "answer": "",
                "sources": []
            }
        
        # Step 2: Check for pre-computed Q&A pairs first
        conn = self.get_db_connection()
        try:
            qa_cursor = conn.execute("""
                SELECT answer, source_document_id, source_page, confidence_score 
                FROM qa_pairs 
                WHERE patient_id = ? AND LOWER(question) LIKE LOWER(?)
                ORDER BY confidence_score DESC
                LIMIT 1
            """, (patient_id, f"%{question}%"))
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
        
        # Step 3: Retrieve relevant document chunks
        relevant_chunks = self.retrieve_relevant_chunks(patient_id, question, max_chunks=5)
        
        # Step 4: Generate answer using OpenAI (preferred) or Ollama (fallback)
        if self.openai_available and self.openai_service:
            return self._answer_with_openai(question, clinical_context, relevant_chunks)
        elif self.ollama_available and self.ollama_client:
            return self._answer_with_ollama(question, clinical_context, relevant_chunks)
        else:
            # Final fallback to rule-based response
            return self._generate_fallback_answer(question, clinical_context, relevant_chunks)

    def _answer_with_openai(self, question: str, clinical_context: Dict[str, Any], relevant_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate answer using OpenAI"""
        try:
            # Prepare document context
            document_chunks = []
            sources = []
            
            for chunk in relevant_chunks:
                document_chunks.append(f"From {chunk['filename']} (page {chunk['page_number']}): {chunk['text']}")
                sources.append({
                    "document": chunk["filename"],
                    "page": chunk["page_number"],
                    "relevance_score": chunk.get("relevance_score", 0),
                    "document_type": chunk.get("document_type", "unknown"),
                    "type": "document_chunk"
                })
            
            # Use OpenAI service for clinical Q&A
            openai_result = self.openai_service.answer_clinical_question(
                question, clinical_context, document_chunks
            )
            
            if openai_result["success"]:
                return {
                    "success": True,
                    "answer": openai_result["answer"],
                    "confidence_score": openai_result.get("confidence_score", 0.8),
                    "sources": sources,
                    "method": "rag_openai",
                    "model": self.openai_model,
                    "chunks_used": len(relevant_chunks),
                    "usage": openai_result.get("usage", {})
                }
            else:
                return {
                    "success": False,
                    "error": f"OpenAI generation failed: {openai_result['error']}",
                    "answer": "I apologize, but I'm unable to generate a response at this time due to technical issues.",
                    "sources": sources
                }
                
        except Exception as e:
            print(f"OpenAI answer generation failed: {e}")
            return {
                "success": False,
                "error": f"OpenAI error: {str(e)}",
                "answer": "I apologize, but I encountered an error while processing your question.",
                "sources": []
            }

    def _answer_with_ollama(self, question: str, clinical_context: Dict[str, Any], relevant_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate answer using Ollama (fallback)"""
        try:
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
                    "confidence_score": 0.7,
                    "sources": sources,
                    "method": "rag_ollama",
                    "chunks_used": len(relevant_chunks),
                    "model_stats": {
                        "total_duration": ollama_result.get("total_duration", 0),
                        "eval_count": ollama_result.get("eval_count", 0)
                    }
                }
            else:
                return {
                    "success": False,
                    "error": f"Ollama generation failed: {ollama_result['error']}",
                    "answer": "I apologize, but I'm unable to generate a response at this time due to technical issues.",
                    "sources": sources
                }
                
        except Exception as e:
            print(f"Ollama answer generation failed: {e}")
            return self._generate_fallback_answer(question, clinical_context, relevant_chunks)

    def _generate_fallback_answer(self, question: str, clinical_context: Dict[str, Any], relevant_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a basic fallback answer when AI services are not available"""
        
        patient_name = clinical_context.get("patient", {}).get("name", "the patient")
        question_lower = question.lower()
        
        sources = [{"document": chunk["filename"], "page": chunk["page_number"], "type": "fallback"} for chunk in relevant_chunks]
        
        # Basic keyword-based responses
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
                answer = f"Based on the available lab results for {patient_name}, the creatinine level is {creatinine} and eGFR is {egfr}. These values indicate kidney function status that should be evaluated by a healthcare provider."
            else:
                answer = f"I found some kidney-related information for {patient_name}, but specific lab values need to be reviewed by a healthcare provider."
                
        elif "summary" in question_lower or "overview" in question_lower:
            summary = clinical_context.get("summary", "")
            if summary:
                answer = f"Here's the clinical summary for {patient_name}: {summary}"
            else:
                answer = f"A comprehensive clinical summary for {patient_name} is not currently available."
                
        elif "vitals" in question_lower or "vital signs" in question_lower:
            vitals = clinical_context.get("vitals", [])[:5]  # Most recent 5
            if vitals:
                vital_strings = [f"{v.get('name', 'Unknown')}: {v.get('value', 'N/A')} {v.get('unit', '')}" for v in vitals]
                answer = f"Recent vital signs for {patient_name}: {', '.join(vital_strings)}. Please consult with healthcare provider for clinical interpretation."
            else:
                answer = f"Vital signs information for {patient_name} is not currently available."
                
        elif "lab" in question_lower or "laboratory" in question_lower:
            labs = clinical_context.get("labs", [])[:5]  # Most recent 5
            if labs:
                lab_strings = [f"{lab.get('name', 'Unknown')}: {lab.get('value', 'N/A')} {lab.get('unit', '')}" for lab in labs]
                answer = f"Recent laboratory results for {patient_name}: {'; '.join(lab_strings)}. Please consult with healthcare provider for clinical interpretation."
            else:
                answer = f"Laboratory results for {patient_name} are not currently available."
                
        else:
            # Generic response with available context
            if relevant_chunks:
                answer = f"Based on the available clinical documents for {patient_name}, I found relevant information but cannot provide a detailed analysis without the AI system fully operational. Please consult the clinical documents directly or contact the healthcare provider for specific medical questions."
            else:
                answer = f"I apologize, but I don't have sufficient information to answer that question about {patient_name}. Please ensure all clinical documents have been processed and the AI system is properly configured."
        
        return {
            "success": True,
            "answer": answer,
            "confidence_score": 0.3,
            "sources": sources,
            "method": "fallback"
        }

    def generate_patient_summary(self, patient_id: str) -> Dict[str, Any]:
        """Generate AI-powered patient summary"""
        # Get comprehensive patient context
        clinical_context = self.get_patient_clinical_context(patient_id)
        
        if not clinical_context.get("patient"):
            return {
                "success": False,
                "error": "Patient not found",
                "summary": ""
            }
        
        # Use OpenAI if available
        if self.openai_available and self.openai_service:
            try:
                patient_data = clinical_context["patient"]
                clinical_data = {
                    "vitals": clinical_context.get("vitals", []),
                    "labs": clinical_context.get("labs", []),
                    "existing_summary": clinical_context.get("summary", "")
                }
                
                result = self.openai_service.generate_patient_summary(patient_data, clinical_data)
                
                if result["success"]:
                    return {
                        "success": True,
                        "summary": result["summary"],
                        "confidence_score": result.get("confidence_score", 0.85),
                        "method": "openai_summary",
                        "model": self.openai_model,
                        "usage": result.get("usage", {})
                    }
                else:
                    print(f"OpenAI summary generation failed: {result['error']}")
                    
            except Exception as e:
                print(f"Error generating OpenAI summary: {e}")
        
        # Fallback to basic summary generation
        return self._generate_fallback_summary(clinical_context)

    def _generate_fallback_summary(self, clinical_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate basic summary when AI services are unavailable"""
        try:
            patient = clinical_context.get("patient", {})
            vitals = clinical_context.get("vitals", [])
            labs = clinical_context.get("labs", [])
            existing_summary = clinical_context.get("summary", "")
            
            # Build basic summary
            summary_parts = []
            
            # Patient demographics
            name = patient.get("name", "Unknown")
            age = patient.get("age", "Unknown")
            gender = patient.get("gender", "Unknown")
            summary_parts.append(f"{name} is a {age}-year-old {gender}")
            
            # Use existing summary if available
            if existing_summary:
                summary_parts.append(f"with {existing_summary.lower()}")
            
            # Add key lab findings
            if labs:
                abnormal_labs = []
                for lab in labs[:5]:  # Check first 5 labs
                    name = lab.get("name", "").lower()
                    value = lab.get("value", "")
                    if "creatinine" in name and value:
                        try:
                            if float(value) > 1.3:  # Basic abnormal threshold
                                abnormal_labs.append(f"elevated creatinine ({value} {lab.get('unit', '')})")
                        except ValueError:
                            pass
                
                if abnormal_labs:
                    summary_parts.append(f". Key findings include {', '.join(abnormal_labs)}")
            
            summary = ". ".join(summary_parts) + "."
            
            return {
                "success": True,
                "summary": summary,
                "confidence_score": 0.4,
                "method": "fallback_summary"
            }
            
        except Exception as e:
            print(f"Error generating fallback summary: {e}")
            return {
                "success": False,
                "error": str(e),
                "summary": ""
            }


def test_rag_openai_pipeline():
    """Test the RAG OpenAI pipeline"""
    # Use the existing database
    db_path = Path(__file__).parent.parent.parent / "data" / "clinical_canvas.db"
    
    if not db_path.exists():
        print("Database not found. Please run the backend initialization first.")
        return False
    
    print("Testing RAG OpenAI Pipeline...")
    
    # Test with OpenAI
    rag_openai = RAGPipelineOpenAI(str(db_path), use_openai=True)
    
    if rag_openai.openai_available:
        print("✅ OpenAI service available")
        
        # Test patient summary
        print("\n🧠 Testing patient summary generation...")
        summary_result = rag_openai.generate_patient_summary("uncle-tan-001")
        
        if summary_result["success"]:
            print(f"✅ Summary generated using {summary_result['method']}")
            print(f"Summary: {summary_result['summary'][:200]}...")
        else:
            print(f"❌ Summary failed: {summary_result.get('error', 'Unknown error')}")
    
    else:
        print("⚠️  OpenAI not available, testing fallback mode")
    
    # Test question answering
    test_questions = [
        "What is the current kidney function status?",
        "What are the main concerns with this patient?",
        "What are the recent lab results?"
    ]
    
    for question in test_questions:
        print(f"\nQuestion: {question}")
        result = rag_openai.answer_question("uncle-tan-001", question)
        
        if result["success"]:
            print(f"Answer ({result['method']}): {result['answer'][:150]}...")
            print(f"   Confidence: {result['confidence_score']:.2f}")
            print(f"   Sources: {len(result['sources'])} documents")
        else:
            print(f"Failed: {result.get('error', 'Unknown error')}")
    
    return True


if __name__ == "__main__":
    if test_rag_openai_pipeline():
        print("\n🎉 RAG OpenAI Pipeline is working!")
        print("\nNext steps:")
        print("   1. Set OPENAI_API_KEY environment variable")
        print("   2. Run backend with OpenAI integration")
        print("   3. Test clinical Q&A and summary generation")
    else:
        print("\n❌ RAG OpenAI Pipeline setup incomplete")