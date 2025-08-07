"""
Integration Example: How to use OpenAI Service in FastAPI Backend

This file shows how to integrate the OpenAI service as a drop-in replacement
for the existing Ollama integration in main.py

Key Integration Points:
1. Replace RAG pipeline initialization
2. Update SOAP note generation 
3. Update patient summary generation
4. Update Q&A endpoints
"""

from fastapi import FastAPI, HTTPException
from services import get_rag_pipeline, get_service_status, AIConfig, AIProvider
from pathlib import Path
import os

# Example: Updated lifespan function
async def updated_lifespan(app: FastAPI):
    """Updated lifespan with OpenAI integration"""
    # Startup: Initialize database (same as before)
    # init_database() - keep existing code
    
    # Initialize AI services with OpenAI support
    try:
        # Get database path
        DB_PATH = Path(__file__).parent.parent / "data" / "clinical_canvas.db"
        
        # Initialize RAG pipeline with OpenAI support
        app.state.rag_pipeline = get_rag_pipeline(str(DB_PATH))
        
        if app.state.rag_pipeline:
            print("✅ AI-powered RAG pipeline initialized successfully")
            
            # Print service status
            status = get_service_status()
            print(f"AI Provider: {status['configured_provider']}")
            
            if status['openai']['available']:
                print(f"✅ OpenAI available (Model: {status['openai']['model']})")
            elif status['ollama']['available']:
                print(f"✅ Ollama available (Model: {status['ollama']['model']})")
            else:
                print("⚠️  Using fallback mode - no AI providers available")
        else:
            print("❌ Failed to initialize RAG pipeline")
            app.state.rag_pipeline = None
            
    except Exception as e:
        print(f"Warning: AI pipeline initialization failed: {e}")
        app.state.rag_pipeline = None
    
    yield
    # Shutdown: cleanup if needed


# Example: Updated SOAP note generation using OpenAI
async def generate_soap_note_with_openai(patient_id: str):
    """
    Generate SOAP note using OpenAI service
    This replaces the generate_soap_sections function in main.py
    """
    from services import get_ai_service
    
    # Get AI service (automatically chooses best available)
    ai_service = get_ai_service()
    
    if not ai_service:
        # Fallback to original logic if no AI service available
        return generate_soap_sections_fallback(patient_id)
    
    try:
        # Get patient data (same as original code)
        conn = get_db_connection()  # Use existing function
        
        # Get patient info
        patient_cursor = conn.execute("SELECT id, name, age, gender FROM patients WHERE id = ?", (patient_id,))
        patient_row = patient_cursor.fetchone()
        
        if not patient_row:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Get clinical data 
        vitals_cursor = conn.execute("""
            SELECT name, value, unit, date_recorded 
            FROM clinical_data 
            WHERE patient_id = ? AND data_type = 'vital'
            ORDER BY date_recorded DESC LIMIT 10
        """, (patient_id,))
        vitals_data = [dict(row) for row in vitals_cursor.fetchall()]
        
        labs_cursor = conn.execute("""
            SELECT name, value, unit, reference_range, date_recorded
            FROM clinical_data 
            WHERE patient_id = ? AND data_type = 'lab'
            ORDER BY date_recorded DESC LIMIT 15
        """, (patient_id,))
        labs_data = [dict(row) for row in labs_cursor.fetchall()]
        
        # Get AI summary
        summary_cursor = conn.execute(
            "SELECT summary_text FROM ai_summaries WHERE patient_id = ?",
            (patient_id,)
        )
        summary_row = summary_cursor.fetchone()
        
        conn.close()
        
        # Prepare data for AI service
        patient_data = dict(patient_row)
        clinical_data = {
            "summary": summary_row["summary_text"] if summary_row else None,
            "vitals": vitals_data,
            "labs": labs_data
        }
        
        # Use OpenAI service to generate SOAP note
        if hasattr(ai_service, 'generate_soap_note'):
            # OpenAI service
            result = ai_service.generate_soap_note(patient_data, clinical_data)
            
            if result["success"]:
                return result["soap_sections"]
            else:
                print(f"AI SOAP generation failed: {result['error']}")
                return generate_soap_sections_fallback(patient_id)
        else:
            # Ollama service - need to implement SOAP generation wrapper
            return generate_soap_with_ollama(ai_service, patient_data, clinical_data)
            
    except Exception as e:
        print(f"Error in SOAP generation: {e}")
        return generate_soap_sections_fallback(patient_id)


def generate_soap_with_ollama(ollama_service, patient_data, clinical_data):
    """Generate SOAP note using Ollama service"""
    # Build clinical context for Ollama
    context = {
        "patient": patient_data,
        "summary": clinical_data.get("summary", ""),
        "labs": clinical_data.get("labs", []),
        "vitals": clinical_data.get("vitals", [])
    }
    
    # Create SOAP generation prompt
    soap_prompt = """Generate a professional SOAP note based on the provided patient data. 
    Structure your response with clear sections:
    - Subjective: Patient's reported symptoms and history
    - Objective: Clinical findings, vital signs, lab results
    - Assessment: Clinical analysis and diagnosis
    - Plan: Treatment and follow-up recommendations"""
    
    result = ollama_service.answer_clinical_question(soap_prompt, context)
    
    if result["success"]:
        # Parse the response into SOAP sections (basic parsing)
        content = result["response"]
        # Would need to implement parsing logic similar to OpenAI service
        return parse_ollama_soap_response(content)
    else:
        return generate_soap_sections_fallback(None)


def generate_soap_sections_fallback(patient_id):
    """Fallback SOAP generation (use existing logic from main.py)"""
    # This would contain the existing generate_soap_sections function logic
    # from main.py as a fallback when AI services are not available
    pass


# Example: Updated patient Q&A endpoint 
async def ask_question_with_openai(patient_id: str, question: str):
    """
    Updated ask_question endpoint using OpenAI-enabled RAG pipeline
    This shows how to replace the existing ask_question endpoint
    """
    
    # Check if patient exists (same as original)
    conn = get_db_connection()
    try:
        patient_cursor = conn.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
        if not patient_cursor.fetchone():
            raise HTTPException(status_code=404, detail="Patient not found")
    finally:
        conn.close()
    
    # Use the enhanced RAG pipeline with OpenAI support
    if hasattr(app.state, 'rag_pipeline') and app.state.rag_pipeline:
        try:
            rag_result = app.state.rag_pipeline.answer_question(patient_id, question)
            
            if rag_result["success"]:
                # Get primary source for response
                primary_source = None
                primary_page = None
                
                if rag_result["sources"]:
                    primary_source = rag_result["sources"][0].get("document")
                    primary_page = rag_result["sources"][0].get("page")
                
                return {
                    "answer": rag_result["answer"],
                    "source_document": primary_source,
                    "source_page": primary_page,
                    "confidence_score": rag_result.get("confidence_score", 0.5),
                    "method": rag_result.get("method", "unknown"),
                    "model_info": {
                        "provider": rag_result.get("method", "").split("_")[1] if "_" in rag_result.get("method", "") else "unknown",
                        "chunks_used": rag_result.get("chunks_used", 0)
                    }
                }
            else:
                print(f"RAG pipeline failed: {rag_result.get('error', 'Unknown error')}")
        
        except Exception as e:
            print(f"RAG pipeline error: {e}")
    
    # Fallback to original logic (same as in main.py)
    # ... existing fallback code ...


# Example: Configuration endpoint to check AI service status
async def get_ai_status():
    """New endpoint to check AI service configuration and status"""
    try:
        status = get_service_status()
        return {
            "status": "success",
            "ai_services": status,
            "rag_pipeline_available": hasattr(app.state, 'rag_pipeline') and app.state.rag_pipeline is not None
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "ai_services": {},
            "rag_pipeline_available": False
        }


# Configuration examples:

def setup_openai_only():
    """Configure to use only OpenAI"""
    os.environ["AI_PROVIDER"] = "openai" 
    os.environ["OPENAI_API_KEY"] = "your-api-key-here"
    os.environ["OPENAI_MODEL"] = "gpt-4"

def setup_ollama_only():
    """Configure to use only Ollama"""
    os.environ["AI_PROVIDER"] = "ollama"
    os.environ["OLLAMA_BASE_URL"] = "http://localhost:11434"
    os.environ["OLLAMA_MODEL"] = "llama3:8b"

def setup_auto_detection():
    """Configure to auto-detect best available service"""
    os.environ["AI_PROVIDER"] = "auto"  # This is the default
    os.environ["OPENAI_API_KEY"] = "your-api-key-here"  # Optional
    # Will try OpenAI first, fallback to Ollama, then to rule-based responses


if __name__ == "__main__":
    print("OpenAI Integration Example")
    print("==========================")
    
    print("\nThis file shows how to integrate OpenAI service into the existing FastAPI backend.")
    print("\nKey integration steps:")
    print("1. Update the lifespan function in main.py to use get_rag_pipeline()")
    print("2. Replace generate_soap_sections() with AI-powered SOAP generation")
    print("3. Update the ask_question endpoint to use the enhanced RAG pipeline")
    print("4. Add AI status endpoint for monitoring")
    print("5. Set environment variables for configuration")
    
    print("\nEnvironment variable examples:")
    print("export AI_PROVIDER=openai")
    print("export OPENAI_API_KEY=your-api-key-here") 
    print("export OPENAI_MODEL=gpt-4")
    
    print("\nOr for auto-detection:")
    print("export AI_PROVIDER=auto")
    print("export OPENAI_API_KEY=your-api-key-here")
    
    print("\nThe system will automatically:")
    print("- Use OpenAI if API key is provided and service is available")
    print("- Fallback to Ollama if OpenAI is not available")
    print("- Use rule-based responses if no AI services are available")
    
    # Test configuration
    print("\nCurrent AI service status:")
    try:
        status = get_service_status()
        for service, info in status.items():
            if isinstance(info, dict) and 'available' in info:
                status_icon = "✅" if info['available'] else "❌"
                print(f"  {service}: {status_icon}")
    except Exception as e:
        print(f"  Error checking status: {e}")