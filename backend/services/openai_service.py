"""
OpenAI Service for AI-Powered Clinical Canvas
A drop-in replacement for Ollama integration with enhanced clinical capabilities
"""

import os
import json
import time
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
import asyncio
import logging

# Import OpenAI (will need to be added to requirements.txt)
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None

# Configure logging
logger = logging.getLogger(__name__)

class OpenAIService:
    """
    OpenAI service wrapper for clinical AI tasks
    Provides methods for patient summarization, SOAP note generation, and clinical Q&A
    """
    
    def __init__(
        self, 
        api_key: Optional[str] = None,
        model: str = "gpt-4",
        organization: Optional[str] = None,
        max_retries: int = 3,
        timeout: int = 60
    ):
        """
        Initialize OpenAI service
        
        Args:
            api_key: OpenAI API key (falls back to OPENAI_API_KEY env var)
            model: Model to use (gpt-4, gpt-3.5-turbo, etc.)
            organization: OpenAI organization ID (optional)
            max_retries: Number of retry attempts on failure
            timeout: Request timeout in seconds
        """
        if not OPENAI_AVAILABLE:
            raise ImportError("OpenAI library not installed. Run: pip install openai")
            
        # Get API key from parameter or environment
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "OpenAI API key not provided. Set OPENAI_API_KEY environment variable or pass api_key parameter"
            )
            
        # Initialize client
        self.client = OpenAI(
            api_key=self.api_key,
            organization=organization,
            timeout=timeout,
            max_retries=max_retries
        )
        
        self.model = model
        self.max_retries = max_retries
        self.timeout = timeout
        
        # Clinical prompt templates
        self.clinical_prompts = {
            "system_clinical": """You are a clinical AI assistant specialized in analyzing patient data and providing evidence-based medical insights. Your responses should be:
- Accurate and based on clinical evidence
- Clear and professional
- Appropriately cautious about limitations
- Focused on supporting healthcare providers

Always include relevant clinical reasoning and mention when further medical evaluation is recommended.""",
            
            "patient_summary": """Analyze the provided patient information and create a comprehensive clinical summary. Include:

1. Key demographic information
2. Primary medical conditions and concerns
3. Significant clinical findings (labs, vitals, etc.)
4. Risk factors and complications
5. Clinical priorities for ongoing care

Focus on actionable clinical insights that would help healthcare providers understand the patient's current status and care needs.""",

            "soap_generation": """Generate a professional SOAP note based on the provided patient data. Structure your response as:

**Subjective:** Patient's reported symptoms, concerns, and relevant history
**Objective:** Clinical findings, vital signs, laboratory results, and physical exam findings
**Assessment:** Clinical analysis, differential diagnosis, and condition status
**Plan:** Treatment recommendations, follow-up care, and monitoring plans

Ensure the SOAP note is clinically appropriate and follows standard medical documentation practices.""",

            "clinical_qa": """Answer the clinical question based on the provided patient context and available data. Your response should:

1. Directly address the question asked
2. Use the patient's specific clinical data
3. Provide relevant clinical reasoning
4. Acknowledge any limitations in the available data
5. Suggest additional evaluation if needed

Be specific and evidence-based in your analysis."""
        }

    def is_available(self) -> bool:
        """
        Check if OpenAI service is available and configured properly
        
        Returns:
            bool: True if service is available, False otherwise
        """
        try:
            # Test with a simple completion
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5,
                timeout=10
            )
            return bool(response.choices and response.choices[0].message)
        except Exception as e:
            logger.error(f"OpenAI availability check failed: {e}")
            return False

    def generate_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 1000,
        context: Optional[List[str]] = None,
        json_mode: bool = False
    ) -> Dict[str, Any]:
        """
        Generate a completion using OpenAI
        
        Args:
            prompt: The main prompt/question
            system_prompt: System message to set behavior (optional)
            temperature: Sampling temperature (0.0-2.0)
            max_tokens: Maximum tokens in response
            context: Additional context strings to include
            json_mode: Whether to force JSON output format
            
        Returns:
            Dict with success status, response, and metadata
        """
        try:
            # Prepare messages
            messages = []
            
            # Add system prompt
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            elif not json_mode:  # Use default clinical system prompt unless in JSON mode
                messages.append({"role": "system", "content": self.clinical_prompts["system_clinical"]})
            
            # Add context if provided
            if context:
                context_text = "\n\n".join(context)
                enhanced_prompt = f"Context:\n{context_text}\n\nQuery: {prompt}"
            else:
                enhanced_prompt = prompt
                
            messages.append({"role": "user", "content": enhanced_prompt})
            
            # Prepare API call parameters
            api_params = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            # Add JSON mode if requested and supported
            if json_mode and self.model in ["gpt-4-1106-preview", "gpt-3.5-turbo-1106"]:
                api_params["response_format"] = {"type": "json_object"}
            
            start_time = time.time()
            
            # Make API call
            response = self.client.chat.completions.create(**api_params)
            
            end_time = time.time()
            
            # Extract response
            if response.choices and response.choices[0].message:
                content = response.choices[0].message.content
                
                return {
                    "success": True,
                    "response": content,
                    "model": self.model,
                    "usage": {
                        "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                        "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                        "total_tokens": response.usage.total_tokens if response.usage else 0
                    },
                    "duration": end_time - start_time,
                    "finish_reason": response.choices[0].finish_reason
                }
            else:
                return {
                    "success": False,
                    "error": "No response content received",
                    "response": ""
                }
                
        except Exception as e:
            logger.error(f"OpenAI completion failed: {e}")
            return {
                "success": False,
                "error": f"OpenAI API error: {str(e)}",
                "response": ""
            }

    def generate_patient_summary(
        self,
        patient_data: Dict[str, Any],
        clinical_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive patient summary
        
        Args:
            patient_data: Basic patient information (name, age, gender, etc.)
            clinical_data: Clinical data including vitals, labs, conditions
            
        Returns:
            Dict with success status and generated summary
        """
        try:
            # Build patient context
            context_parts = []
            
            # Add basic patient information
            if patient_data:
                basic_info = f"Patient: {patient_data.get('name', 'Unknown')}, {patient_data.get('age', 'Unknown')} years old, {patient_data.get('gender', 'Unknown')}"
                context_parts.append(basic_info)
            
            # Add clinical data if provided
            if clinical_data:
                # Add vital signs
                if "vitals" in clinical_data and clinical_data["vitals"]:
                    vitals_text = "Recent Vital Signs:\n"
                    for vital in clinical_data["vitals"]:
                        vitals_text += f"- {vital.get('name', 'Unknown')}: {vital.get('value', 'N/A')} {vital.get('unit', '')} (Date: {vital.get('date_recorded', 'Unknown')})\n"
                    context_parts.append(vitals_text)
                
                # Add laboratory results
                if "labs" in clinical_data and clinical_data["labs"]:
                    labs_text = "Recent Laboratory Results:\n"
                    for lab in clinical_data["labs"]:
                        reference = f" (Reference: {lab.get('reference_range', 'N/A')})" if lab.get('reference_range') else ""
                        labs_text += f"- {lab.get('name', 'Unknown')}: {lab.get('value', 'N/A')} {lab.get('unit', '')}{reference} (Date: {lab.get('date_recorded', 'Unknown')})\n"
                    context_parts.append(labs_text)
                
                # Add existing summary if available
                if "existing_summary" in clinical_data and clinical_data["existing_summary"]:
                    context_parts.append(f"Previous Clinical Summary: {clinical_data['existing_summary']}")
            
            # Generate summary using OpenAI
            result = self.generate_completion(
                prompt=self.clinical_prompts["patient_summary"],
                context=context_parts,
                temperature=0.2,  # Lower temperature for more consistent summaries
                max_tokens=800
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "summary": result["response"],
                    "confidence_score": 0.85,  # High confidence for AI-generated summaries
                    "method": "openai_completion",
                    "model": self.model,
                    "usage": result.get("usage", {})
                }
            else:
                return {
                    "success": False,
                    "error": result["error"],
                    "summary": ""
                }
                
        except Exception as e:
            logger.error(f"Patient summary generation failed: {e}")
            return {
                "success": False,
                "error": f"Summary generation error: {str(e)}",
                "summary": ""
            }

    def generate_soap_note(
        self,
        patient_data: Dict[str, Any],
        clinical_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a SOAP note based on patient and clinical data
        
        Args:
            patient_data: Basic patient information
            clinical_data: Clinical data including vitals, labs, summary
            
        Returns:
            Dict with success status and SOAP sections
        """
        try:
            # Build clinical context for SOAP generation
            context_parts = []
            
            # Patient basic information
            if patient_data:
                patient_info = f"Patient Demographics: {patient_data.get('name', 'Unknown')}, {patient_data.get('age', 'Unknown')} years old, {patient_data.get('gender', 'Unknown')}"
                context_parts.append(patient_info)
            
            # Clinical summary
            if clinical_data.get("summary"):
                context_parts.append(f"Clinical Background: {clinical_data['summary']}")
            
            # Recent vitals
            if clinical_data.get("vitals"):
                vitals_text = "Current Vital Signs:\n"
                for vital in clinical_data["vitals"]:
                    vitals_text += f"- {vital.get('name', 'Unknown')}: {vital.get('value', 'N/A')} {vital.get('unit', '')}\n"
                context_parts.append(vitals_text)
            
            # Laboratory results
            if clinical_data.get("labs"):
                labs_text = "Laboratory Findings:\n"
                for lab in clinical_data["labs"]:
                    reference = f" (Reference: {lab.get('reference_range', 'N/A')})" if lab.get('reference_range') else ""
                    labs_text += f"- {lab.get('name', 'Unknown')}: {lab.get('value', 'N/A')} {lab.get('unit', '')}{reference}\n"
                context_parts.append(labs_text)
            
            # Generate SOAP note
            result = self.generate_completion(
                prompt=self.clinical_prompts["soap_generation"],
                context=context_parts,
                temperature=0.2,
                max_tokens=1200
            )
            
            if result["success"]:
                soap_content = result["response"]
                
                # Parse SOAP sections (basic parsing - in production might use more sophisticated parsing)
                soap_sections = self._parse_soap_sections(soap_content)
                
                return {
                    "success": True,
                    "soap_sections": soap_sections,
                    "raw_content": soap_content,
                    "confidence_score": 0.80,
                    "generated_by": "ai",
                    "method": "openai_soap",
                    "model": self.model,
                    "usage": result.get("usage", {})
                }
            else:
                return {
                    "success": False,
                    "error": result["error"],
                    "soap_sections": None
                }
                
        except Exception as e:
            logger.error(f"SOAP note generation failed: {e}")
            return {
                "success": False,
                "error": f"SOAP generation error: {str(e)}",
                "soap_sections": None
            }

    def answer_clinical_question(
        self,
        question: str,
        patient_context: Dict[str, Any],
        document_chunks: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Answer clinical questions with patient context and document retrieval
        
        Args:
            question: The clinical question to answer
            patient_context: Patient clinical data and context
            document_chunks: Relevant document excerpts (optional)
            
        Returns:
            Dict with success status, answer, and confidence information
        """
        try:
            # Build comprehensive clinical context
            context_parts = []
            
            # Add patient basic info
            if "patient" in patient_context:
                p = patient_context["patient"]
                patient_info = f"Patient: {p.get('name', 'Unknown')}, {p.get('age', 'Unknown')} years old, {p.get('gender', 'Unknown')}"
                context_parts.append(patient_info)
            
            # Add clinical summary
            if "summary" in patient_context:
                context_parts.append(f"Clinical Summary: {patient_context['summary']}")
            
            # Add laboratory results
            if "labs" in patient_context and patient_context["labs"]:
                lab_text = "Laboratory Results:\n"
                for lab in patient_context["labs"][:10]:  # Limit to most recent 10
                    reference = f" (Normal: {lab.get('reference_range', 'N/A')})" if lab.get('reference_range') else ""
                    lab_text += f"- {lab.get('name', 'Unknown')}: {lab.get('value', 'N/A')} {lab.get('unit', '')}{reference} ({lab.get('date_recorded', 'Unknown')})\n"
                context_parts.append(lab_text)
            
            # Add vital signs
            if "vitals" in patient_context and patient_context["vitals"]:
                vitals_text = "Vital Signs:\n"
                for vital in patient_context["vitals"][:8]:  # Limit to most recent 8
                    vitals_text += f"- {vital.get('name', 'Unknown')}: {vital.get('value', 'N/A')} {vital.get('unit', '')} ({vital.get('date_recorded', 'Unknown')})\n"
                context_parts.append(vitals_text)
            
            # Add document chunks if provided
            if document_chunks:
                doc_text = "Relevant Clinical Documents:\n" + "\n".join(document_chunks)
                context_parts.append(doc_text)
            
            # Create clinical question prompt
            clinical_prompt = f"{self.clinical_prompts['clinical_qa']}\n\nQuestion: {question}"
            
            result = self.generate_completion(
                prompt=clinical_prompt,
                context=context_parts,
                temperature=0.2,
                max_tokens=600
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "response": result["response"],
                    "answer": result["response"],  # Backward compatibility
                    "confidence_score": 0.75,
                    "method": "openai_qa",
                    "model": self.model,
                    "context_used": bool(context_parts),
                    "document_chunks_used": len(document_chunks) if document_chunks else 0,
                    "usage": result.get("usage", {})
                }
            else:
                return {
                    "success": False,
                    "error": result["error"],
                    "response": "",
                    "answer": ""
                }
                
        except Exception as e:
            logger.error(f"Clinical Q&A failed: {e}")
            return {
                "success": False,
                "error": f"Clinical Q&A error: {str(e)}",
                "response": "",
                "answer": ""
            }

    def _parse_soap_sections(self, soap_content: str) -> Dict[str, str]:
        """
        Parse SOAP content into structured sections
        
        Args:
            soap_content: Raw SOAP note content from AI
            
        Returns:
            Dict with subjective, objective, assessment, plan sections
        """
        try:
            sections = {
                "subjective": "",
                "objective": "", 
                "assessment": "",
                "plan": ""
            }
            
            # Split content by common SOAP section headers
            lines = soap_content.split('\n')
            current_section = None
            current_content = []
            
            for line in lines:
                line_lower = line.lower().strip()
                
                # Detect section headers
                if any(header in line_lower for header in ['**subjective', 'subjective:', 'subjective']):
                    if current_section and current_content:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = "subjective"
                    current_content = []
                    # Remove the header from the line if it's part of the content
                    clean_line = line.replace('**Subjective:**', '').replace('Subjective:', '').replace('**Subjective', '').strip()
                    if clean_line:
                        current_content.append(clean_line)
                        
                elif any(header in line_lower for header in ['**objective', 'objective:', 'objective']):
                    if current_section and current_content:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = "objective"
                    current_content = []
                    clean_line = line.replace('**Objective:**', '').replace('Objective:', '').replace('**Objective', '').strip()
                    if clean_line:
                        current_content.append(clean_line)
                        
                elif any(header in line_lower for header in ['**assessment', 'assessment:', 'assessment']):
                    if current_section and current_content:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = "assessment"
                    current_content = []
                    clean_line = line.replace('**Assessment:**', '').replace('Assessment:', '').replace('**Assessment', '').strip()
                    if clean_line:
                        current_content.append(clean_line)
                        
                elif any(header in line_lower for header in ['**plan', 'plan:', 'plan']):
                    if current_section and current_content:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = "plan"
                    current_content = []
                    clean_line = line.replace('**Plan:**', '').replace('Plan:', '').replace('**Plan', '').strip()
                    if clean_line:
                        current_content.append(clean_line)
                        
                elif current_section and line.strip():
                    current_content.append(line.strip())
            
            # Don't forget the last section
            if current_section and current_content:
                sections[current_section] = '\n'.join(current_content).strip()
            
            # Fallback: if parsing failed, distribute content evenly
            if not any(sections.values()):
                content_parts = soap_content.split('\n\n')
                if len(content_parts) >= 4:
                    sections["subjective"] = content_parts[0]
                    sections["objective"] = content_parts[1] 
                    sections["assessment"] = content_parts[2]
                    sections["plan"] = '\n\n'.join(content_parts[3:])
                else:
                    # Very basic fallback
                    sections["subjective"] = "Patient information as documented."
                    sections["objective"] = "Clinical findings and data as available."
                    sections["assessment"] = soap_content[:len(soap_content)//2] if soap_content else "Assessment based on available data."
                    sections["plan"] = soap_content[len(soap_content)//2:] if soap_content else "Continue current care plan."
            
            return sections
            
        except Exception as e:
            logger.error(f"SOAP parsing failed: {e}")
            return {
                "subjective": "Patient information as documented.",
                "objective": "Clinical findings and data as available.", 
                "assessment": "Assessment based on available data.",
                "plan": "Continue current care plan with appropriate monitoring."
            }

    async def generate_completion_async(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 1000,
        context: Optional[List[str]] = None,
        json_mode: bool = False
    ) -> Dict[str, Any]:
        """
        Async version of generate_completion for better integration with FastAPI
        
        Args:
            Same as generate_completion
            
        Returns:
            Same as generate_completion
        """
        # Run the synchronous method in a thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            self.generate_completion,
            prompt, system_prompt, temperature, max_tokens, context, json_mode
        )


# Utility functions for easy integration

def create_openai_service(
    model: str = "gpt-4",
    api_key: Optional[str] = None
) -> OpenAIService:
    """
    Factory function to create OpenAI service instance
    
    Args:
        model: OpenAI model to use
        api_key: API key (falls back to environment variable)
        
    Returns:
        Configured OpenAIService instance
    """
    return OpenAIService(api_key=api_key, model=model)


def test_openai_service() -> bool:
    """
    Test OpenAI service configuration and availability
    
    Returns:
        bool: True if service is working, False otherwise
    """
    try:
        service = create_openai_service()
        
        if not service.is_available():
            print("❌ OpenAI service is not available. Check your API key and network connection.")
            return False
            
        print("✅ OpenAI service is available")
        
        # Test basic completion
        result = service.generate_completion(
            prompt="Hello, this is a test. Please respond with 'OpenAI service is working!'",
            max_tokens=50
        )
        
        if result["success"]:
            print("✅ OpenAI completion working")
            print(f"   Response: {result['response'][:100]}...")
            print(f"   Model: {result.get('model', 'unknown')}")
            print(f"   Tokens used: {result.get('usage', {}).get('total_tokens', 0)}")
            return True
        else:
            print(f"❌ Completion test failed: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing OpenAI service: {e}")
        return False


if __name__ == "__main__":
    # Test the OpenAI service
    print("Testing OpenAI Service Configuration...")
    
    if not OPENAI_AVAILABLE:
        print("❌ OpenAI library not installed.")
        print("Install with: pip install openai")
        exit(1)
    
    if test_openai_service():
        print("\n🎉 OpenAI service is ready!")
        
        # Example clinical usage
        try:
            service = create_openai_service()
            
            sample_patient_data = {
                "name": "Uncle Tan",
                "age": 68,
                "gender": "Male"
            }
            
            sample_clinical_data = {
                "summary": "68-year-old male with progressive chronic kidney disease (Stage 4)",
                "labs": [
                    {"name": "Creatinine", "value": "4.2", "unit": "mg/dL", "reference_range": "0.7-1.3", "date_recorded": "2024-01-15"},
                    {"name": "eGFR", "value": "18", "unit": "mL/min/1.73m²", "reference_range": ">60", "date_recorded": "2024-01-15"}
                ],
                "vitals": [
                    {"name": "Blood Pressure", "value": "145/88", "unit": "mmHg", "date_recorded": "2024-01-15"},
                    {"name": "Heart Rate", "value": "72", "unit": "bpm", "date_recorded": "2024-01-15"}
                ]
            }
            
            print("\n🧠 Testing patient summary generation...")
            summary_result = service.generate_patient_summary(sample_patient_data, sample_clinical_data)
            
            if summary_result["success"]:
                print("✅ Patient summary generated successfully")
                print(f"Summary: {summary_result['summary'][:200]}...")
            else:
                print(f"❌ Summary generation failed: {summary_result['error']}")
                
            print("\n📝 Testing clinical Q&A...")
            qa_context = {
                "patient": sample_patient_data,
                "summary": sample_clinical_data["summary"],
                "labs": sample_clinical_data["labs"],
                "vitals": sample_clinical_data["vitals"]
            }
            
            qa_result = service.answer_clinical_question(
                "What is the current kidney function status and what are the key concerns?",
                qa_context
            )
            
            if qa_result["success"]:
                print("✅ Clinical Q&A working")
                print(f"Answer: {qa_result['answer'][:200]}...")
            else:
                print(f"❌ Clinical Q&A failed: {qa_result['error']}")
                
        except Exception as e:
            print(f"❌ Clinical testing failed: {e}")
            
    else:
        print("\n❌ OpenAI service setup incomplete. Please check your API key and configuration.")
        print("Set your API key: export OPENAI_API_KEY='your-api-key-here'")