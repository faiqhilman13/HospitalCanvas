"""
Ollama Client for LLaMA 3 Integration
Handles communication with local Ollama instance
"""

import requests
import json
from typing import Dict, Any, Optional, List
import time

class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "llama3:8b"
        
    def is_available(self) -> bool:
        """Check if Ollama server is available"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def pull_model(self, model_name: str = "llama3") -> bool:
        """Pull/download the specified model"""
        try:
            response = requests.post(
                f"{self.base_url}/api/pull",
                json={"name": model_name},
                stream=True,
                timeout=300  # 5 minutes timeout for model download
            )
            
            if response.status_code == 200:
                print(f"Model {model_name} pulled successfully")
                return True
            else:
                print(f"Failed to pull model: {response.status_code}")
                return False
                
        except requests.RequestException as e:
            print(f"Error pulling model: {e}")
            return False
    
    def generate_response(
        self, 
        prompt: str, 
        model: str = None, 
        context: Optional[List[str]] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> Dict[str, Any]:
        """Generate response using Ollama"""
        if not model:
            model = self.model
            
        # Prepare the prompt with context if provided
        full_prompt = prompt
        if context:
            context_text = "\n\n".join(context)
            full_prompt = f"Context:\n{context_text}\n\nQuestion: {prompt}\n\nAnswer based on the provided context:"
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": model,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens
                    }
                },
                timeout=60  # 1 minute timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "response": result.get("response", ""),
                    "model": model,
                    "context_used": bool(context),
                    "total_duration": result.get("total_duration", 0),
                    "load_duration": result.get("load_duration", 0),
                    "prompt_eval_count": result.get("prompt_eval_count", 0),
                    "eval_count": result.get("eval_count", 0)
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "response": ""
                }
                
        except requests.RequestException as e:
            return {
                "success": False,
                "error": f"Request failed: {str(e)}",
                "response": ""
            }
    
    def answer_clinical_question(
        self, 
        question: str, 
        patient_context: Dict[str, Any],
        document_chunks: List[str] = None
    ) -> Dict[str, Any]:
        """Answer clinical questions with patient context"""
        
        # Build clinical context
        clinical_context = []
        
        # Add patient basic info
        if "patient" in patient_context:
            p = patient_context["patient"]
            clinical_context.append(f"Patient: {p.get('name', 'Unknown')}, {p.get('age', 'Unknown')} years old, {p.get('gender', 'Unknown')}")
        
        # Add clinical summary
        if "summary" in patient_context:
            clinical_context.append(f"Clinical Summary: {patient_context['summary']}")
        
        # Add lab results
        if "labs" in patient_context:
            lab_text = "Laboratory Results:\n"
            for lab in patient_context["labs"]:
                lab_text += f"- {lab.get('name', 'Unknown')}: {lab.get('value', 'N/A')} {lab.get('unit', '')} (Normal: {lab.get('reference_range', 'N/A')})\n"
            clinical_context.append(lab_text)
        
        # Add vitals
        if "vitals" in patient_context:
            vitals_text = "Vital Signs:\n"
            for vital in patient_context["vitals"]:
                vitals_text += f"- {vital.get('name', 'Unknown')}: {vital.get('value', 'N/A')} {vital.get('unit', '')}\n"
            clinical_context.append(vitals_text)
        
        # Add document chunks if provided
        if document_chunks:
            clinical_context.extend(document_chunks)
        
        # Create clinical prompt
        clinical_prompt = f"""You are a clinical AI assistant. Answer the following question based on the provided patient information and clinical context. 

Provide a clear, accurate, and helpful response. If you're uncertain about something, mention it. Include relevant clinical reasoning.

Question: {question}"""
        
        return self.generate_response(
            clinical_prompt,
            context=clinical_context,
            temperature=0.3,  # Lower temperature for more consistent clinical responses
            max_tokens=300
        )


def test_ollama_connection():
    """Test Ollama connection and setup"""
    client = OllamaClient()
    
    print("Testing Ollama connection...")
    if not client.is_available():
        print("❌ Ollama server is not available. Please ensure Ollama is running.")
        print("   Install: https://ollama.ai/")
        print("   Start: ollama serve")
        return False
    
    print("✅ Ollama server is available")
    
    # Test model availability
    try:
        test_response = client.generate_response(
            "Hello, this is a test. Please respond with 'Hello, Ollama is working!'",
            max_tokens=50
        )
        
        if test_response["success"]:
            print("✅ Ollama model is working")
            print(f"   Response: {test_response['response'][:100]}...")
            return True
        else:
            print(f"❌ Model test failed: {test_response['error']}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing model: {e}")
        return False


if __name__ == "__main__":
    # Test the Ollama setup
    if test_ollama_connection():
        print("\n🎉 Ollama integration is ready!")
        
        # Example clinical question
        client = OllamaClient()
        
        sample_context = {
            "patient": {"name": "Uncle Tan", "age": 68, "gender": "Male"},
            "summary": "68-year-old male with progressive chronic kidney disease (Stage 4)",
            "labs": [
                {"name": "Creatinine", "value": "4.2", "unit": "mg/dL", "reference_range": "0.7-1.3"},
                {"name": "eGFR", "value": "18", "unit": "mL/min/1.73m²", "reference_range": ">60"}
            ]
        }
        
        print("\n🧠 Testing clinical question...")
        result = client.answer_clinical_question(
            "What is the current kidney function status?",
            sample_context
        )
        
        if result["success"]:
            print(f"Answer: {result['response']}")
        else:
            print(f"Error: {result['error']}")
    else:
        print("\n❌ Ollama setup incomplete. Please install and start Ollama with LLaMA 3 model.")