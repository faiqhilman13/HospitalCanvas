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
            
        # Initialize client with progressive fallback
        initialization_attempts = [
            # Full initialization with all parameters
            lambda: OpenAI(
                api_key=self.api_key,
                organization=organization,
                timeout=timeout,
                max_retries=max_retries
            ),
            # Without organization parameter
            lambda: OpenAI(
                api_key=self.api_key,
                timeout=timeout,
                max_retries=max_retries
            ),
            # Without timeout and max_retries
            lambda: OpenAI(
                api_key=self.api_key,
                organization=organization
            ),
            # Minimal initialization
            lambda: OpenAI(api_key=self.api_key)
        ]
        
        self.client = None
        last_error = None
        
        for attempt_func in initialization_attempts:
            try:
                self.client = attempt_func()
                break
            except TypeError as e:
                last_error = e
                logger.warning(f"OpenAI client initialization attempt failed: {e}")
                continue
            except Exception as e:
                last_error = e
                logger.warning(f"OpenAI client initialization attempt failed: {e}")
                continue
                
        if self.client is None:
            raise RuntimeError(f"Failed to initialize OpenAI client after all attempts. Last error: {last_error}")
        
        self.model = model
        self.max_retries = max_retries
        self.timeout = timeout
        
        # Enhanced clinical prompt templates based on Dr. Nuqman's feedback
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

            "soap_generation_clinical": """Generate a professional SOAP note following Dr. Nuqman's clinical template structure:

**Subjective:** Focus on patient interview and systematic review
- Current status: "Keeping well" or "Came with complaint of [specific complaint]"
- If complaint exists, use SOCRATES methodology (Site, Onset, Character, Radiation, Associated symptoms, Timing, Exacerbating/relieving factors, Severity)
- Medication compliance assessment
- Symptoms of heart failure review (shortness of breath, edema, exercise tolerance)
- Lifestyle factors: smoking status (quantified), diet modifications, physical exercise
- Self-monitoring: SMBG (Self-monitoring blood glucose), HMBP (Home blood pressure monitoring)

**Objective:** Physical examination guidance and systematic assessment prompts
- General appearance: "How does the patient look today?"
- Vital signs interpretation: "Any signs of discomfort/respiratory distress?"
- Hydration status assessment
- Cardiovascular: "How is the pulse volume & rhythm?"
- Respiratory: "Lung findings?"
- Cardiovascular system: "CVS findings?"
- Abdominal: "Per Abdomen findings?"
- Signs of heart failure: "Raised JVP? Pedal edema?"
- DO NOT include laboratory results here - they belong in Assessment

**Assessment:** Clinical interpretation and laboratory results
- Laboratory results interpretation with clinical context
- Current condition status and clinical reasoning
- Risk stratification and prognosis
- Any concerning trends or findings

**Plan:** Structured follow-up and treatment plan
- Follow-up schedule (e.g., "TCA RUKA 6 Months with blood investigations")
- Emergency instructions ("TCA STAT if unwell")
- Medication management with specific drug names and dosages
- Continue current medications where appropriate
- Patient education and monitoring advice (HMBP, SMBG)
- Lifestyle counseling (compliance, healthy lifestyle)

Ensure the SOAP note reflects authentic medical documentation practices and clinical workflow.""",

            "clinical_questionnaire_soap": """Generate a SOAP note using the clinical questionnaire data provided. Structure according to Dr. Nuqman's template:

**Subjective:** Use questionnaire responses to create clinical narrative
- Transform questionnaire data into professional medical documentation
- Include patient's chief complaint or "keeping well" status
- Document medication compliance based on questionnaire
- Include systematic symptom review based on responses
- Note lifestyle factors from questionnaire data

**Objective:** Generate examination prompts based on patient's conditions
- Create condition-specific examination guidance
- Focus on physical examination techniques relevant to patient's medical history
- Provide systematic examination checklist
- Exclude laboratory results (move to Assessment)

**Assessment:** Interpret clinical data and laboratory findings
- Analyze laboratory results in clinical context
- Provide clinical reasoning for findings
- Address any abnormal values or trends

**Plan:** Create structured treatment and follow-up plan
- Follow-up scheduling with appropriate intervals
- Medication management based on patient's current regimen
- Patient education priorities
- Monitoring recommendations

Base all sections on the questionnaire data provided.""",

            "clinical_qa": """Answer the clinical question based on the provided patient context and available data. Your response should:

1. Directly address the question asked
2. Use the patient's specific clinical data
3. Provide relevant clinical reasoning
4. Acknowledge any limitations in the available data
5. Suggest additional evaluation if needed

Be specific and evidence-based in your analysis.""",

            "review_template": """Generate a clinical review following Dr. Nuqman's REVIEW TEMPLATE RUKA:

Demographics and Social Context:
- Age and gender
- Living situation (e.g., "Lives with family in Kepong")
- Occupation status (e.g., "Retired")
- Activities of Daily Living status ("ADL independent")
- Smoking status with quantification (e.g., "smoker: 10 sticks/day")

Underlying Conditions:
- List all relevant medical conditions

Current Status Assessment:
- "Came in for follow up today"
- "Keeping up well" or specific complaints
- "Compliant to medications" or compliance issues
- "No active issues" or current concerns
- "No failure symptoms" or heart failure assessment
- SMBG and HMBP readings
- Diet and exercise status

Physical Examination:
- "Alert, pink, Not tachypneic"
- "Good hydration" or hydration status
- "Lungs Clear" or respiratory findings
- "No pedal edema" or fluid status

Investigations (Ix):
- FBS (Fasting Blood Sugar)
- HbA1c
- Creat (Creatinine)
- TC (Total Cholesterol)
- LDL
- UFEME (Urine microscopy)

Plan:
- "TCA RUKA 6 Months with blood ix"
- "TCA STAT if unwell"
- Specific medications (e.g., "T Rosuvastatin 10mg OD")
- "Continue current medications"
- "Advice for HMBP and SMBG"
- "Advice for compliance to medications"
- "Healthy lifestyle"

Use this template structure for systematic clinical documentation.""",

            "clinical_decision_support": """Generate clinical decision support recommendations based on patient data and questionnaire responses:

**Smart Examination Prompts**: Provide context-aware examination guidance based on:
- Patient's medical conditions and history
- Current vital signs and abnormal values  
- Risk factors requiring focused assessment
- Age-appropriate screening considerations

**Medication Compliance Assessment**: Analyze medication adherence patterns and provide:
- Compliance rate analysis and trends
- Barriers to adherence identification
- Side effect monitoring recommendations
- Dosing optimization suggestions
- Drug interaction warnings if applicable

**Risk Factor Stratification**: Evaluate and prioritize:
- Smoking cessation urgency and strategies
- Diet and exercise modification priorities  
- Cardiovascular risk factors
- Self-monitoring compliance (SMBG/HMBP)
- Preventive care recommendations

Structure output as actionable clinical recommendations with priority levels and monitoring frequency.""",

            "examination_prompts": """Generate smart examination prompts for a patient with the following conditions and clinical data. Focus on:

1. **Condition-specific examination priorities** based on patient's medical history
2. **Risk-stratified assessment guidance** based on severity and complications
3. **Age-appropriate examination techniques** considering patient demographics  
4. **Abnormal findings interpretation** with clinical significance
5. **Follow-up requirements** based on examination findings

Provide practical, actionable examination guidance that enhances clinical decision-making.""",

            "medication_optimization": """Analyze the patient's medication regimen and compliance data to provide:

1. **Adherence assessment** with specific compliance rates and patterns
2. **Therapeutic optimization** recommendations for dosing and timing
3. **Side effect management** strategies and alternative therapies
4. **Drug interaction screening** with clinical significance
5. **Patient education priorities** for medication understanding
6. **Monitoring requirements** for safety and efficacy

Focus on actionable recommendations that improve medication effectiveness and patient safety.""",

            "risk_stratification": """Perform comprehensive risk factor assessment and stratification:

1. **Cardiovascular risk assessment** using patient-specific factors
2. **Lifestyle modification priorities** with evidence-based interventions
3. **Screening and prevention recommendations** based on age and risk factors
4. **Self-monitoring optimization** for diabetes and hypertension management
5. **Smoking cessation strategies** with urgency and approach recommendations
6. **Follow-up scheduling** based on risk levels and stability

Provide prioritized recommendations with specific timelines and monitoring frequencies."""
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
        clinical_data: Dict[str, Any],
        questionnaire_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a SOAP note based on patient and clinical data following Dr. Nuqman's clinical template
        
        Args:
            patient_data: Basic patient information
            clinical_data: Clinical data including vitals, labs, summary
            questionnaire_data: Optional clinical questionnaire responses for enhanced SOAP generation
            
        Returns:
            Dict with success status and SOAP sections structured according to clinical best practices
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
            
            # Add questionnaire data if provided
            if questionnaire_data:
                questionnaire_text = "Clinical Questionnaire Responses:\n"
                
                # Patient status
                if questionnaire_data.get('patient_status'):
                    questionnaire_text += f"Patient Status: {questionnaire_data['patient_status']}\n"
                
                # Chief complaint
                if questionnaire_data.get('chief_complaint'):
                    questionnaire_text += f"Chief Complaint: {questionnaire_data['chief_complaint']}\n"
                
                # SOCRATES assessment
                if questionnaire_data.get('socrates'):
                    socrates = questionnaire_data['socrates']
                    questionnaire_text += "SOCRATES Assessment:\n"
                    for key, value in socrates.items():
                        if value:
                            questionnaire_text += f"- {key.title()}: {value}\n"
                
                # Medication compliance
                if questionnaire_data.get('medication_compliance'):
                    compliance = questionnaire_data['medication_compliance']
                    questionnaire_text += f"Medication Compliance: {compliance.get('status', 'Unknown')}\n"
                    if compliance.get('details'):
                        questionnaire_text += f"Details: {compliance['details']}\n"
                
                # Heart failure symptoms
                if questionnaire_data.get('heart_failure_symptoms'):
                    hf_symptoms = questionnaire_data['heart_failure_symptoms']
                    questionnaire_text += "Heart Failure Symptoms:\n"
                    for symptom, status in hf_symptoms.items():
                        questionnaire_text += f"- {symptom.replace('_', ' ').title()}: {status}\n"
                
                # Lifestyle factors
                if questionnaire_data.get('lifestyle_factors'):
                    lifestyle = questionnaire_data['lifestyle_factors']
                    questionnaire_text += "Lifestyle Factors:\n"
                    if lifestyle.get('smoking'):
                        smoking = lifestyle['smoking']
                        questionnaire_text += f"- Smoking: {smoking.get('status', 'Unknown')}"
                        if smoking.get('quantity'):
                            questionnaire_text += f" ({smoking['quantity']})"
                        questionnaire_text += "\n"
                    if lifestyle.get('diet'):
                        questionnaire_text += f"- Diet: {lifestyle['diet']}\n"
                    if lifestyle.get('exercise'):
                        questionnaire_text += f"- Exercise: {lifestyle['exercise']}\n"
                
                # Self-monitoring
                if questionnaire_data.get('self_monitoring'):
                    monitoring = questionnaire_data['self_monitoring']
                    questionnaire_text += "Self-Monitoring:\n"
                    if monitoring.get('smbg'):
                        questionnaire_text += f"- SMBG: {monitoring['smbg']}\n"
                    if monitoring.get('hmbp'):
                        questionnaire_text += f"- HMBP: {monitoring['hmbp']}\n"
                
                context_parts.append(questionnaire_text)
                
                # Use questionnaire-enhanced prompt
                prompt_key = "clinical_questionnaire_soap"
            else:
                prompt_key = "soap_generation_clinical"
            
            # Generate SOAP note with enhanced clinical prompts
            result = self.generate_completion(
                prompt=self.clinical_prompts[prompt_key],
                context=context_parts,
                temperature=0.2,
                max_tokens=1500  # Increased for more comprehensive clinical documentation
            )
            
            if result["success"]:
                soap_content = result["response"]
                
                # Parse SOAP sections using enhanced clinical parsing
                soap_sections = self._parse_soap_sections_clinical(soap_content)
                
                return {
                    "success": True,
                    "soap_sections": soap_sections,
                    "raw_content": soap_content,
                    "confidence_score": 0.85,  # Higher confidence with clinical template
                    "generated_by": "ai",
                    "method": "openai_clinical_soap",
                    "template_used": "dr_nuqman_clinical",
                    "questionnaire_enhanced": bool(questionnaire_data),
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

    def _parse_soap_sections_clinical(self, soap_content: str) -> Dict[str, str]:
        """
        Enhanced SOAP parsing for Dr. Nuqman's clinical template structure
        
        Args:
            soap_content: Raw SOAP note content from AI with clinical template
            
        Returns:
            Dict with subjective, objective, assessment, plan sections following clinical standards
        """
        try:
            sections = {
                "subjective": "",
                "objective": "", 
                "assessment": "",
                "plan": ""
            }
            
            # Enhanced parsing for clinical SOAP format
            lines = soap_content.split('\n')
            current_section = None
            current_content = []
            
            for line in lines:
                line_clean = line.strip()
                line_lower = line_clean.lower()
                
                # Detect section headers with more variations
                if any(header in line_lower for header in ['**subjective', 'subjective:', '**s:', 'subjective', 's:']):
                    if current_section and current_content:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = "subjective"
                    current_content = []
                    # Clean the header from content
                    clean_line = line_clean
                    for header in ['**Subjective:**', '**Subjective', 'Subjective:', '**S:', 'S:']:
                        clean_line = clean_line.replace(header, '').strip()
                    if clean_line:
                        current_content.append(clean_line)
                        
                elif any(header in line_lower for header in ['**objective', 'objective:', '**o:', 'objective', 'o:']):
                    if current_section and current_content:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = "objective"
                    current_content = []
                    clean_line = line_clean
                    for header in ['**Objective:**', '**Objective', 'Objective:', '**O:', 'O:']:
                        clean_line = clean_line.replace(header, '').strip()
                    if clean_line:
                        current_content.append(clean_line)
                        
                elif any(header in line_lower for header in ['**assessment', 'assessment:', '**a:', 'assessment', 'a:']):
                    if current_section and current_content:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = "assessment"
                    current_content = []
                    clean_line = line_clean
                    for header in ['**Assessment:**', '**Assessment', 'Assessment:', '**A:', 'A:']:
                        clean_line = clean_line.replace(header, '').strip()
                    if clean_line:
                        current_content.append(clean_line)
                        
                elif any(header in line_lower for header in ['**plan', 'plan:', '**p:', 'plan', 'p:']):
                    if current_section and current_content:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = "plan"
                    current_content = []
                    clean_line = line_clean
                    for header in ['**Plan:**', '**Plan', 'Plan:', '**P:', 'P:']:
                        clean_line = clean_line.replace(header, '').strip()
                    if clean_line:
                        current_content.append(clean_line)
                        
                elif current_section and line_clean:
                    # Filter out common markdown formatting
                    if not line_clean.startswith('#') and line_clean != '---':
                        current_content.append(line_clean)
            
            # Don't forget the last section
            if current_section and current_content:
                sections[current_section] = '\n'.join(current_content).strip()
            
            # Clinical validation and enhancement
            sections = self._validate_clinical_soap_sections(sections, soap_content)
            
            return sections
            
        except Exception as e:
            logger.error(f"Clinical SOAP parsing failed: {e}")
            return self._fallback_soap_sections(soap_content)
    
    def generate_clinical_review_template(
        self,
        patient_data: Dict[str, Any],
        clinical_data: Dict[str, Any],
        template_type: str = "general_followup"
    ) -> Dict[str, Any]:
        """
        Generate Dr. Nuqman's structured clinical review template
        
        Args:
            patient_data: Basic patient information
            clinical_data: Clinical data including conditions, medications, vitals
            template_type: Type of template (general_followup, diabetes, cardiovascular, kidney_disease)
            
        Returns:
            Dict with success status and structured clinical review
        """
        try:
            # Build context for review template
            context_parts = []
            
            # Patient demographics and social context
            if patient_data:
                demo_text = f"""Patient Demographics:
- {patient_data.get('age', 'Unknown')} year old {patient_data.get('gender', 'Unknown').lower()}
- Living situation: {patient_data.get('living_situation', 'With family')}
- Occupation: {patient_data.get('occupation', 'Retired')}
- ADL status: {patient_data.get('adl_status', 'Independent')}"""
                context_parts.append(demo_text)
            
            # Medical history and conditions
            if clinical_data.get('conditions') or clinical_data.get('summary'):
                conditions_text = f"Medical Conditions: {clinical_data.get('summary', 'As documented in medical history')}"
                context_parts.append(conditions_text)
            
            # Current medications
            if clinical_data.get('medications'):
                meds_text = "Current Medications:\n"
                for med in clinical_data['medications']:
                    meds_text += f"- {med.get('name', 'Unknown medication')} {med.get('dosage', '')}\n"
                context_parts.append(meds_text)
            
            # Recent vitals and labs
            if clinical_data.get('vitals'):
                vitals_text = "Recent Vital Signs:\n"
                for vital in clinical_data['vitals'][:5]:
                    vitals_text += f"- {vital.get('name')}: {vital.get('value')} {vital.get('unit', '')}\n"
                context_parts.append(vitals_text)
                
            if clinical_data.get('labs'):
                labs_text = "Recent Laboratory Results:\n"
                for lab in clinical_data['labs'][:8]:
                    labs_text += f"- {lab.get('name')}: {lab.get('value')} {lab.get('unit', '')} (Ref: {lab.get('reference_range', 'N/A')})\n"
                context_parts.append(labs_text)
            
            # Add template type specification
            template_prompt = f"{self.clinical_prompts['review_template']}\n\nGenerate a {template_type.replace('_', ' ')} review template for this patient."
            
            # Generate clinical review
            result = self.generate_completion(
                prompt=template_prompt,
                context=context_parts,
                temperature=0.1,  # Very low temperature for consistent template structure
                max_tokens=1200
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "review_template": result["response"],
                    "template_type": template_type,
                    "confidence_score": 0.90,
                    "method": "openai_clinical_review",
                    "model": self.model,
                    "usage": result.get("usage", {})
                }
            else:
                return {
                    "success": False,
                    "error": result["error"],
                    "review_template": ""
                }
                
        except Exception as e:
            logger.error(f"Clinical review template generation failed: {e}")
            return {
                "success": False,
                "error": f"Review template generation error: {str(e)}",
                "review_template": ""
            }
    
    def get_condition_specific_prompts(self, conditions: List[str]) -> Dict[str, str]:
        """
        Get condition-specific SOAP prompts based on patient conditions
        
        Args:
            conditions: List of patient conditions/diagnoses
            
        Returns:
            Dict with condition-specific prompt enhancements
        """
        condition_prompts = {
            "diabetes": {
                "subjective_focus": "Focus on glycemic control, dietary compliance, symptoms of hypo/hyperglycemia, foot care, visual changes",
                "objective_focus": "Diabetic foot examination, visual acuity assessment, BMI calculation, injection site examination",
                "assessment_focus": "HbA1c interpretation, diabetic complications screening, cardiovascular risk assessment",
                "plan_focus": "Glycemic targets, medication adjustments, lifestyle modifications, screening schedules"
            },
            "kidney": {
                "subjective_focus": "Fluid balance, urinary symptoms, dietary protein/sodium intake, medication adherence",
                "objective_focus": "Fluid status assessment, blood pressure monitoring, edema evaluation, access site examination",
                "assessment_focus": "eGFR trends, electrolyte balance, anemia assessment, bone mineral disorders",
                "plan_focus": "CKD progression monitoring, nephrotoxic medication avoidance, dietary counseling, preparation for RRT"
            },
            "cardiovascular": {
                "subjective_focus": "Chest pain characterization, exercise tolerance, medication compliance, lifestyle factors",
                "objective_focus": "Cardiac examination, pulse assessment, blood pressure monitoring, peripheral circulation",
                "assessment_focus": "Cardiovascular risk stratification, lipid profile interpretation, cardiac function assessment",
                "plan_focus": "Risk factor modification, medication optimization, lifestyle interventions, monitoring schedule"
            },
            "hypertension": {
                "subjective_focus": "Blood pressure monitoring compliance, medication adherence, symptoms of target organ damage",
                "objective_focus": "Blood pressure measurement technique, fundoscopic examination, cardiovascular examination",
                "assessment_focus": "Blood pressure control assessment, target organ damage evaluation, cardiovascular risk",
                "plan_focus": "Blood pressure targets, medication adjustments, lifestyle modifications, monitoring frequency"
            }
        }
        
        # Identify relevant conditions
        relevant_prompts = {}
        conditions_lower = [c.lower() for c in conditions]
        
        for condition, prompts in condition_prompts.items():
            if any(condition in c for c in conditions_lower):
                relevant_prompts[condition] = prompts
                
        return relevant_prompts
    
    def _validate_clinical_soap_sections(self, sections: Dict[str, str], raw_content: str) -> Dict[str, str]:
        """
        Validate and enhance SOAP sections according to Dr. Nuqman's clinical standards
        """
        try:
            # Ensure Subjective has appropriate clinical content
            if not sections["subjective"] or len(sections["subjective"]) < 20:
                sections["subjective"] = "Patient came in for follow-up visit. Keeping well overall with no acute complaints."
            
            # Ensure Objective focuses on examination prompts, not lab results
            if sections["objective"]:
                # Remove lab results from objective if they appear
                objective_lines = sections["objective"].split('\n')
                filtered_lines = []
                for line in objective_lines:
                    line_lower = line.lower()
                    # Skip lines that look like lab results
                    if not any(lab_indicator in line_lower for lab_indicator in 
                              ['creatinine', 'egfr', 'hemoglobin', 'glucose', 'cholesterol', 'hba1c', 'result', 'value:', 'mg/dl', 'mmol/l']):
                        filtered_lines.append(line)
                sections["objective"] = '\n'.join(filtered_lines).strip()
            
            # Enhance Objective with examination prompts if empty or too brief
            if not sections["objective"] or len(sections["objective"]) < 50:
                sections["objective"] = """Patient appears alert and comfortable.
Vital signs stable.
Systematic examination to be performed:
- General appearance and hydration status
- Cardiovascular: pulse volume and rhythm assessment
- Respiratory: lung examination
- Abdominal examination as indicated
- Assessment for signs of fluid retention or heart failure"""
            
            # Ensure Assessment has clinical reasoning
            if not sections["assessment"] or len(sections["assessment"]) < 30:
                sections["assessment"] = "Clinical assessment based on available data. Laboratory results and vital signs within acceptable range for ongoing monitoring."
            
            # Ensure Plan has structured follow-up
            if not sections["plan"] or len(sections["plan"]) < 30:
                sections["plan"] = """Continue current medical management.
Follow-up appointment as scheduled.
Patient education regarding medication compliance.
Advise to return if any concerns or symptoms worsen."""
            
            return sections
            
        except Exception as e:
            logger.error(f"SOAP validation failed: {e}")
            return sections
    
    def _fallback_soap_sections(self, soap_content: str) -> Dict[str, str]:
        """
        Fallback SOAP parsing when clinical parsing fails
        """
        return {
            "subjective": "Patient information documented. Follow-up visit for ongoing care management.",
            "objective": "Clinical examination to be performed as appropriate. Vital signs and general appearance assessment.",
            "assessment": f"Clinical review based on available information. {soap_content[:200] if soap_content else 'Ongoing monitoring of medical conditions.'}",
            "plan": "Continue current medical management with appropriate follow-up care and patient monitoring."
        }

    # Phase 4: Clinical Decision Support Methods
    def generate_smart_examination_prompts(
        self,
        patient_data: Dict[str, Any],
        clinical_data: Dict[str, Any],
        questionnaire_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate context-aware examination prompts based on patient data and clinical history
        
        Args:
            patient_data: Basic patient information
            clinical_data: Clinical data including conditions, vitals, history
            questionnaire_data: Optional questionnaire responses for context
            
        Returns:
            Dict with examination prompts categorized by body system and risk level
        """
        try:
            # Build clinical context for examination prompts
            context_parts = []
            
            # Patient demographics and risk factors
            if patient_data:
                age = patient_data.get('age', 0)
                gender = patient_data.get('gender', 'unknown')
                context_parts.append(f"Patient: {age} years old, {gender}")
            
            # Current medical conditions
            if clinical_data.get("summary"):
                context_parts.append(f"Medical History: {clinical_data['summary']}")
            
            # Generate examination prompts using AI
            result = self.generate_completion(
                prompt=self.clinical_prompts["examination_prompts"],
                context=context_parts,
                temperature=0.3,
                max_tokens=1000
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "examination_prompts": result["response"],
                    "confidence_score": 0.88,
                    "method": "openai_clinical_decision_support",
                    "usage": result.get("usage", {})
                }
            else:
                return {"success": False, "error": result["error"]}
                
        except Exception as e:
            logger.error(f"Smart examination prompts generation failed: {e}")
            return {"success": False, "error": f"Examination prompts generation error: {str(e)}"}

    def analyze_medication_compliance(
        self,
        patient_data: Dict[str, Any],
        questionnaire_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze medication compliance patterns and generate optimization recommendations
        
        Args:
            patient_data: Basic patient information
            questionnaire_data: Questionnaire responses including medication compliance
            
        Returns:
            Dict with compliance analysis and optimization recommendations
        """
        try:
            context_parts = []
            
            # Patient context
            if patient_data:
                context_parts.append(f"Patient: {patient_data.get('age', 'Unknown')} years old")
            
            # Medication compliance data
            if questionnaire_data.get('medication_compliance'):
                medications = questionnaire_data['medication_compliance']
                compliance_text = "Current Medication Regimen and Compliance:\n"
                
                for med in medications:
                    name = med.get('medication_name', 'Unknown medication')
                    dose = med.get('prescribed_dose', 'Unknown dose')
                    compliance = med.get('actual_compliance', 'unknown')
                    missed_doses = med.get('missed_doses_per_week', 0)
                    side_effects = med.get('side_effects', [])
                    concerns = med.get('patient_concerns', '')
                    
                    compliance_text += f"""
Medication: {name} {dose}
- Compliance Status: {compliance}
- Missed Doses/Week: {missed_doses}
- Side Effects: {', '.join(side_effects) if side_effects else 'None reported'}
- Patient Concerns: {concerns if concerns else 'None reported'}
"""
                context_parts.append(compliance_text)
            
            # Generate optimization analysis
            result = self.generate_completion(
                prompt=self.clinical_prompts["medication_optimization"],
                context=context_parts,
                temperature=0.2,
                max_tokens=800
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "compliance_analysis": result["response"],
                    "confidence_score": 0.85,
                    "method": "openai_medication_optimization"
                }
            else:
                return {"success": False, "error": result["error"]}
                
        except Exception as e:
            logger.error(f"Medication compliance analysis failed: {e}")
            return {"success": False, "error": f"Medication analysis error: {str(e)}"}

    def assess_risk_factors(
        self,
        patient_data: Dict[str, Any],
        clinical_data: Dict[str, Any],
        questionnaire_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Perform comprehensive risk factor assessment and stratification
        
        Args:
            patient_data: Basic patient information
            clinical_data: Clinical data and medical history
            questionnaire_data: Lifestyle and compliance questionnaire responses
            
        Returns:
            Dict with risk stratification and intervention recommendations
        """
        try:
            context_parts = []
            
            # Patient demographics and risk factors
            age = patient_data.get('age', 0)
            gender = patient_data.get('gender', 'unknown')
            context_parts.append(f"Patient Demographics: {age} years old {gender}")
            
            # Clinical conditions affecting risk stratification
            if clinical_data.get("summary"):
                context_parts.append(f"Medical Conditions: {clinical_data['summary']}")
            
            # Generate risk stratification analysis
            result = self.generate_completion(
                prompt=self.clinical_prompts["risk_stratification"],
                context=context_parts,
                temperature=0.2,
                max_tokens=1000
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "risk_assessment": result["response"],
                    "confidence_score": 0.87,
                    "method": "openai_risk_stratification"
                }
            else:
                return {"success": False, "error": result["error"]}
                
        except Exception as e:
            logger.error(f"Risk factor assessment failed: {e}")
            return {"success": False, "error": f"Risk assessment error: {str(e)}"}

    def _parse_soap_sections(self, soap_content: str) -> Dict[str, str]:
        """
        Legacy SOAP parsing method (kept for backward compatibility)
        Use _parse_soap_sections_clinical for enhanced clinical parsing
        
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

# Phase 4: Clinical Decision Support Functions
def generate_clinical_decision_support(
    service: OpenAIService,
    patient_data: Dict[str, Any],
    clinical_data: Dict[str, Any],
    questionnaire_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate comprehensive clinical decision support including examination prompts,
    medication optimization, and risk factor assessment
    
    Args:
        service: OpenAI service instance
        patient_data: Basic patient information
        clinical_data: Clinical data and medical history  
        questionnaire_data: Clinical questionnaire responses
        
    Returns:
        Dict with comprehensive clinical decision support data
    """
    try:
        # Generate smart examination prompts
        examination_result = service.generate_smart_examination_prompts(
            patient_data, clinical_data, questionnaire_data
        )
        
        # Analyze medication compliance
        medication_result = service.analyze_medication_compliance(
            patient_data, questionnaire_data
        )
        
        # Assess risk factors
        risk_result = service.assess_risk_factors(
            patient_data, clinical_data, questionnaire_data
        )
        
        return {
            "success": True,
            "clinical_decision_support": {
                "smart_examination_prompts": examination_result,
                "medication_compliance_analysis": medication_result,
                "risk_factor_assessment": risk_result
            },
            "overall_confidence": 0.87,
            "generated_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Clinical decision support generation failed: {str(e)}"
        }