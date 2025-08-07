# OpenAI Service Integration for Clinical Canvas

This directory contains the OpenAI service wrapper and integration components for the AI-Powered Clinical Canvas backend. The service provides a drop-in replacement for the existing Ollama integration with enhanced clinical capabilities.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
# Required: OpenAI API Key
export OPENAI_API_KEY="your-api-key-here"

# Optional: Configuration
export AI_PROVIDER="openai"      # or "ollama" or "auto" (default)
export OPENAI_MODEL="gpt-4"      # or "gpt-3.5-turbo"
export OPENAI_ORGANIZATION="your-org-id"  # if applicable
```

### 3. Test the Integration

```bash
# Test OpenAI service directly
python -m services.openai_service

# Test full integration
python test_openai_integration.py

# Test configuration
python -m services.ai_config
```

### 4. Use in FastAPI Backend

The service is designed as a drop-in replacement. See `integration_example.py` for detailed integration instructions.

## 📁 File Structure

```
services/
├── __init__.py                 # Package exports
├── openai_service.py          # Core OpenAI wrapper service
├── rag_openai.py             # Enhanced RAG pipeline with OpenAI
├── ai_config.py              # Configuration and service factory
├── integration_example.py     # FastAPI integration examples
├── test_openai_integration.py # Test suite
└── README.md                 # This file
```

## 🔧 Components

### OpenAI Service (`openai_service.py`)

Main service wrapper providing:

- **General completions** with clinical system prompts
- **Patient summarization** with structured clinical data
- **SOAP note generation** with proper medical formatting
- **Clinical Q&A** with patient context and document retrieval
- **Error handling and retry logic**
- **Usage tracking and monitoring**

```python
from services import create_openai_service

service = create_openai_service(model="gpt-4")

# Generate patient summary
result = service.generate_patient_summary(patient_data, clinical_data)

# Answer clinical questions
answer = service.answer_clinical_question(question, patient_context, documents)

# Generate SOAP notes
soap = service.generate_soap_note(patient_data, clinical_data)
```

### Enhanced RAG Pipeline (`rag_openai.py`)

Upgraded RAG pipeline supporting both OpenAI and Ollama:

- **Intelligent provider selection** (OpenAI preferred, Ollama fallback)
- **Document chunk retrieval** with relevance scoring
- **Clinical context integration** from patient data
- **Multi-source answer generation** with confidence scoring
- **Comprehensive error handling** and graceful degradation

```python
from services import get_rag_pipeline

rag = get_rag_pipeline(db_path)
result = rag.answer_question(patient_id, question)
```

### Configuration System (`ai_config.py`)

Centralized configuration and service factory:

- **Environment-based configuration** with sensible defaults
- **Automatic provider detection** and availability checking
- **Service factory pattern** for clean dependency injection
- **Status monitoring** for all AI services
- **Flexible deployment options** (OpenAI-only, Ollama-only, auto-detect)

```python
from services import get_service_status, get_ai_service

# Check what's available
status = get_service_status()

# Get the best available service
ai_service = get_ai_service()
```

## 🏥 Clinical Features

### Patient Summarization
- Comprehensive clinical summary generation
- Integration with vitals, labs, and medical history
- Professional medical language and structure
- Confidence scoring for AI-generated content

### SOAP Note Generation
- Structured Subjective, Objective, Assessment, Plan format
- Clinical data integration and analysis
- Professional medical documentation standards
- Automatic section parsing and formatting

### Clinical Q&A
- Context-aware medical question answering
- Patient-specific data integration
- Document retrieval and citation
- Clinical reasoning and evidence-based responses

### Document Processing
- Medical document chunk retrieval
- Relevance scoring for clinical content
- Multi-document synthesis for comprehensive answers
- Source citation and page references

## 🔄 Integration with Existing System

### Replace Ollama in main.py

```python
# OLD: Ollama initialization
from rag_pipeline import RAGPipeline
app.state.rag_pipeline = RAGPipeline(str(DB_PATH), use_ollama=True)

# NEW: OpenAI-enabled RAG pipeline
from services import get_rag_pipeline
app.state.rag_pipeline = get_rag_pipeline(str(DB_PATH))
```

### Enhanced SOAP Generation

```python
# OLD: Basic SOAP generation
soap_sections = generate_soap_sections(patient_row, vitals_data, labs_data, summary_data)

# NEW: AI-powered SOAP generation
from services import get_ai_service
ai_service = get_ai_service()
result = ai_service.generate_soap_note(patient_data, clinical_data)
soap_sections = result["soap_sections"]
```

### Improved Q&A Responses

The existing Q&A endpoint automatically benefits from:
- Better clinical reasoning
- More accurate medical information
- Proper source citation
- Higher confidence scoring

## 🌍 Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `AI_PROVIDER` | Which AI provider to use | `auto` | `openai`, `ollama`, `auto` |
| `OPENAI_API_KEY` | OpenAI API key | None | `sk-...` |
| `OPENAI_MODEL` | OpenAI model name | `gpt-4` | `gpt-3.5-turbo` |
| `OPENAI_ORGANIZATION` | OpenAI organization ID | None | `org-...` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` | Custom URL |
| `OLLAMA_MODEL` | Ollama model name | `llama3:8b` | `llama3:70b` |
| `AI_MAX_RETRIES` | Max retry attempts | `3` | `5` |
| `AI_TIMEOUT` | Request timeout (seconds) | `60` | `120` |
| `AI_FALLBACK_ENABLED` | Enable fallback to rule-based responses | `true` | `false` |

## 📊 Provider Selection Logic

1. **OpenAI First**: If `OPENAI_API_KEY` is set and service is available
2. **Ollama Fallback**: If OpenAI unavailable but Ollama is running
3. **Rule-based Fallback**: If no AI services available, use intelligent rule-based responses

This ensures the system always provides responses, even with no AI services configured.

## 🧪 Testing

### Test Suite (`test_openai_integration.py`)

Comprehensive test suite covering:
- OpenAI service functionality
- Configuration system
- RAG pipeline with OpenAI
- Clinical function testing
- Integration compatibility

```bash
# Run all tests
python test_openai_integration.py

# Test individual components
python -m services.openai_service
python -m services.ai_config
python -m services.rag_openai
```

### Manual Testing

```python
# Test OpenAI service directly
from services import create_openai_service, test_openai_service
test_openai_service()

# Test configuration
from services import get_service_status
print(get_service_status())

# Test RAG pipeline
from services import get_rag_pipeline
rag = get_rag_pipeline("path/to/database.db")
result = rag.answer_question("patient-id", "What are the recent lab results?")
```

## 🔒 Security & Privacy

- **API Key Security**: Keys loaded from environment variables only
- **No Data Logging**: Patient data is not logged or persisted by OpenAI service
- **Request Timeout**: Configurable timeouts prevent hanging requests
- **Error Sanitization**: Sensitive information removed from error messages
- **Fallback Systems**: Graceful degradation when services unavailable

## 📈 Performance

- **Efficient Token Usage**: Optimized prompts for clinical tasks
- **Caching Support**: Ready for response caching implementation
- **Parallel Processing**: Async support for FastAPI integration
- **Resource Monitoring**: Usage tracking and performance metrics
- **Intelligent Fallbacks**: Fast rule-based responses when needed

## 🚨 Error Handling

- **Comprehensive Exception Handling**: All failure modes covered
- **Graceful Degradation**: System continues functioning with reduced capabilities
- **Detailed Error Messages**: Clear debugging information
- **Retry Logic**: Automatic retries with exponential backoff
- **Fallback Chains**: Multiple fallback options for reliability

## 📚 API Reference

### OpenAI Service Methods

#### `generate_completion(prompt, system_prompt=None, temperature=0.3, max_tokens=1000, context=None, json_mode=False)`
General-purpose text completion with clinical system prompt.

#### `generate_patient_summary(patient_data, clinical_data=None)`
Generate comprehensive patient summary from structured data.

#### `generate_soap_note(patient_data, clinical_data)`
Generate structured SOAP note with proper medical formatting.

#### `answer_clinical_question(question, patient_context, document_chunks=None)`
Answer clinical questions with patient context and document retrieval.

### Configuration Methods

#### `get_ai_service()`
Get the best available AI service based on configuration.

#### `get_rag_pipeline(db_path)`
Get RAG pipeline with OpenAI integration.

#### `get_service_status()`
Get current status of all AI services.

## 🤝 Contributing

When adding new clinical features:

1. Follow the existing pattern in `openai_service.py`
2. Add comprehensive error handling
3. Include clinical system prompts
4. Add tests to `test_openai_integration.py`
5. Update documentation

## 📋 TODO

- [ ] Response caching implementation
- [ ] Advanced clinical prompt templates
- [ ] Multi-model support (GPT-4, GPT-3.5-turbo switching)
- [ ] Cost monitoring and usage analytics
- [ ] Advanced SOAP note customization
- [ ] Integration with medical coding systems (ICD-10, CPT)

## 📞 Support

For issues with the OpenAI integration:

1. Check environment variables are set correctly
2. Verify API key has sufficient credits and permissions  
3. Run the test suite to identify specific failures
4. Check network connectivity to OpenAI API
5. Review logs for detailed error messages

The system is designed to gracefully handle all failure modes and provide meaningful fallback responses.