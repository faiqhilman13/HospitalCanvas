# HospitalCanvas Deployment Plan
**Backend: Railway + OpenAI API | Frontend: Netlify**

---

## 🎯 Deployment Overview

**Current Architecture:**
- Frontend: React app → Netlify ✅ (Already configured)
- Backend: FastAPI + SQLite → Railway 🔄 (To be deployed)
- AI Service: Local Ollama → OpenAI API 🔄 (To be migrated)

**Target Architecture:**
- Frontend: Netlify (Static React build)
- Backend: Railway (FastAPI + PostgreSQL/SQLite)
- AI Service: OpenAI API (GPT-4/3.5-turbo)

---

## 🚂 Railway Backend Deployment

### Prerequisites
1. Railway account: https://railway.app/
2. OpenAI API key: https://platform.openai.com/api-keys
3. GitHub repository connected to Railway

### Railway Configuration Files Needed

#### 1. **`railway.json`** (Project configuration)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT"
  }
}
```

#### 2. **`Procfile`** (Alternative startup method)
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### 3. **Environment Variables on Railway**
```
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=sk-...
ENVIRONMENT=production
CORS_ORIGINS=https://your-netlify-app.netlify.app
PORT=8000
```

---

## 🤖 OpenAI API Migration

### Files to Modify

#### 1. **`backend/requirements.txt`**
**Current:**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
```

**Updated:**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
openai==1.35.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
```

#### 2. **`ai-pipeline/requirements.txt`**
**Remove:**
```txt
# Remove Ollama-specific dependencies
```

**Add:**
```txt
openai==1.35.0
python-dotenv==1.0.0
tiktoken==0.7.0
```

### New OpenAI Service Implementation

#### 3. **Create `backend/services/openai_service.py`**
```python
import os
import openai
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class OpenAIService:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.client = openai.OpenAI()
        self.model = "gpt-3.5-turbo"  # or "gpt-4"
        
    def generate_completion(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate text completion using OpenAI API"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    def generate_patient_summary(self, clinical_data: Dict[str, Any]) -> str:
        """Generate patient summary using clinical data"""
        prompt = f"""
        Based on the following clinical data, generate a concise patient summary:
        
        Patient: {clinical_data.get('patient', {})}
        Vitals: {clinical_data.get('vitals', [])}
        Labs: {clinical_data.get('labs', [])}
        
        Please provide:
        1. Key clinical findings
        2. Primary concerns
        3. Urgency level (low/medium/high/critical)
        
        Keep it professional and concise.
        """
        return self.generate_completion(prompt, max_tokens=300)
    
    def generate_soap_note(self, patient_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate SOAP note sections"""
        prompt = f"""
        Generate a SOAP note for this patient:
        
        Patient Info: {patient_data.get('patient', {})}
        Vitals: {patient_data.get('vitals', [])}
        Labs: {patient_data.get('labs', [])}
        
        Please format as:
        SUBJECTIVE: [patient's reported symptoms and history]
        OBJECTIVE: [clinical findings, vitals, lab results]
        ASSESSMENT: [clinical assessment and diagnosis]
        PLAN: [treatment plan and follow-up]
        """
        
        response = self.generate_completion(prompt, max_tokens=600)
        
        # Parse response into sections
        sections = {"subjective": "", "objective": "", "assessment": "", "plan": ""}
        current_section = None
        
        for line in response.split('\n'):
            line = line.strip()
            if line.upper().startswith('SUBJECTIVE:'):
                current_section = 'subjective'
                sections[current_section] = line[11:].strip()
            elif line.upper().startswith('OBJECTIVE:'):
                current_section = 'objective'
                sections[current_section] = line[10:].strip()
            elif line.upper().startswith('ASSESSMENT:'):
                current_section = 'assessment'
                sections[current_section] = line[11:].strip()
            elif line.upper().startswith('PLAN:'):
                current_section = 'plan'
                sections[current_section] = line[5:].strip()
            elif current_section and line:
                sections[current_section] += " " + line
                
        return sections
    
    def answer_clinical_question(self, question: str, context: str) -> str:
        """Answer clinical questions with context"""
        prompt = f"""
        Context: {context}
        
        Question: {question}
        
        Based on the provided clinical context, please answer the question accurately and concisely. 
        If the context doesn't contain enough information, state that clearly.
        """
        return self.generate_completion(prompt, max_tokens=400)
```

#### 4. **Update `ai-pipeline/rag_pipeline.py`**
**Replace Ollama integration:**
```python
# Replace this section:
from ollama_client import OllamaClient

# With:
from backend.services.openai_service import OpenAIService

class RAGPipeline:
    def __init__(self, db_path: str, use_openai: bool = True):
        self.db_path = Path(db_path)
        self.openai_service = OpenAIService() if use_openai else None
        self.doc_processor = DocumentProcessor()
        self.embedding_service = MockEmbeddingService()
        
    def answer_question(self, patient_id: str, question: str) -> Dict[str, Any]:
        """Answer question using RAG with OpenAI"""
        try:
            # Get relevant document chunks
            relevant_chunks = self.retrieve_relevant_chunks(patient_id, question)
            
            # Get clinical context
            clinical_context = self.get_patient_clinical_context(patient_id)
            
            # Combine context
            context = ""
            if relevant_chunks:
                context = "\n".join([chunk["text"] for chunk in relevant_chunks[:3]])
            
            if clinical_context:
                context += f"\n\nClinical Data: {clinical_context}"
            
            # Generate answer using OpenAI
            if self.openai_service and context:
                answer = self.openai_service.answer_clinical_question(question, context)
                
                sources = []
                for chunk in relevant_chunks[:2]:
                    sources.append({
                        "document": chunk.get("filename", "Unknown"),
                        "page": chunk.get("page_number", 1),
                        "text": chunk["text"][:200] + "..."
                    })
                
                return {
                    "success": True,
                    "answer": answer,
                    "sources": sources,
                    "confidence_score": 0.8
                }
            
            return {
                "success": False,
                "error": "No context available or OpenAI service unavailable"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
```

#### 5. **Update `backend/main.py`**
**Replace Ollama imports and initialization:**
```python
# Remove:
# from rag_pipeline import RAGPipeline

# Add:
from services.openai_service import OpenAIService
from ai_pipeline.rag_pipeline import RAGPipeline
import os
from dotenv import load_dotenv

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    init_database()
    
    # Initialize OpenAI service
    try:
        app.state.openai_service = OpenAIService()
        app.state.rag_pipeline = RAGPipeline(str(DB_PATH), use_openai=True)
        print("OpenAI service initialized successfully")
    except Exception as e:
        print(f"Warning: OpenAI service initialization failed: {e}")
        app.state.openai_service = None
        app.state.rag_pipeline = None
    
    yield
    # Shutdown: cleanup if needed

# Update SOAP generation function:
def generate_soap_sections(patient_row, vitals_data, labs_data, summary_data):
    """Generate SOAP sections using OpenAI"""
    if hasattr(app.state, 'openai_service') and app.state.openai_service:
        patient_data = {
            "patient": dict(patient_row),
            "vitals": vitals_data[:5],  # Recent vitals
            "labs": labs_data[:5],     # Recent labs
            "summary": summary_data
        }
        
        try:
            sections = app.state.openai_service.generate_soap_note(patient_data)
            return SOAPSection(
                subjective=sections.get("subjective", "Patient information not available."),
                objective=sections.get("objective", "Clinical findings not available."),
                assessment=sections.get("assessment", "Assessment pending."),
                plan=sections.get("plan", "Treatment plan to be determined.")
            )
        except Exception as e:
            print(f"OpenAI SOAP generation error: {e}")
            # Fall back to original logic
            pass
    
    # Fallback to existing implementation
    # ... (keep existing code as fallback)
```

#### 6. **Update CORS for Production**
```python
# Update CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174", 
        "http://localhost:5173", 
        "http://localhost:3000",
        "https://your-netlify-app.netlify.app",  # Add your Netlify URL
        os.getenv("CORS_ORIGINS", "").split(",")  # Production origins
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Database Migration (Optional: SQLite → PostgreSQL)

### For Production Scale (Recommended)

#### 1. **Add PostgreSQL Support**
```python
# backend/database.py
import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./clinical_canvas.db")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_database():
    if DATABASE_URL.startswith("postgresql://"):
        return "postgresql"
    return "sqlite"
```

#### 2. **Update Schema for PostgreSQL**
```sql
-- For PostgreSQL (modify existing schema)
-- Replace SQLite-specific types with PostgreSQL equivalents
-- TEXT → TEXT
-- INTEGER → INTEGER  
-- REAL → DECIMAL
-- DATETIME → TIMESTAMP
```

---

## 🔐 Environment Configuration

### Railway Environment Variables
```
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...

# Database (Railway will provide PostgreSQL URL)
DATABASE_URL=postgresql://username:password@host:port/database

# API Configuration
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=https://your-netlify-app.netlify.app

# Optional: Custom settings
MAX_UPLOAD_SIZE=10485760
JWT_SECRET_KEY=your-secret-key
```

### Frontend Environment Variables (Netlify)
```
# .env.production (or Netlify Environment Variables)
VITE_API_URL=https://your-railway-app.railway.app/api
VITE_ENVIRONMENT=production
```

---

## 📁 File Structure Changes

```
backend/
├── main.py                     # Updated with OpenAI integration
├── requirements.txt            # Added OpenAI, PostgreSQL deps
├── railway.json               # New: Railway configuration
├── Procfile                   # New: Alternative startup
├── .env.example              # New: Environment template
├── services/
│   └── openai_service.py     # New: OpenAI service wrapper
└── database.py               # New: Database abstraction

ai-pipeline/
├── requirements.txt          # Updated for OpenAI
├── rag_pipeline.py          # Updated to use OpenAI
├── document_processor.py    # Keep existing
└── embedding_service.py     # New: OpenAI embeddings (optional)

frontend/
├── .env.production          # New: Production API URL
└── src/
    └── config/
        └── api.ts          # New: API configuration
```

---

## 🚀 Deployment Steps

### Phase 1: Backend Railway Deployment
1. **Create Railway Project**
   - Connect GitHub repository
   - Select backend folder as root
   - Add environment variables

2. **Database Setup**
   - Add PostgreSQL plugin (or keep SQLite for MVP)
   - Run database migrations
   - Populate demo data

3. **Test API Endpoints**
   - Verify health check: `GET /`
   - Test patient endpoints: `GET /api/patients`
   - Test OpenAI integration: `POST /api/patients/{id}/ask`

### Phase 2: Frontend Configuration
1. **Update API URL**
   - Set `VITE_API_URL` to Railway backend URL
   - Update CORS configuration on backend

2. **Redeploy Frontend**
   - Push changes to netlify branch
   - Verify API connectivity

### Phase 3: Testing & Optimization
1. **End-to-End Testing**
   - Test all clinical modules
   - Verify AI Q&A functionality  
   - Test SOAP note generation

2. **Performance Monitoring**
   - Monitor OpenAI API usage
   - Check Railway metrics
   - Optimize database queries

---

## 💰 Cost Estimation

### Railway (Backend Hosting)
- **Hobby Plan**: $5/month
- **Pro Plan**: $20/month (for production)
- PostgreSQL: $5/month additional

### OpenAI API
- **GPT-3.5-turbo**: $0.0015/1K input tokens, $0.002/1K output tokens
- **GPT-4**: $0.03/1K input tokens, $0.06/1K output tokens
- **Estimated monthly cost**: $20-50 (depending on usage)

### Netlify (Frontend)
- **Free tier**: Sufficient for demo/portfolio
- **Pro Plan**: $19/month (if needed)

**Total Estimated Cost**: $30-75/month

---

## 🔒 Security Considerations

### API Security
- Environment variables for all secrets
- CORS properly configured for production domains
- Rate limiting for OpenAI endpoints
- Input validation and sanitization

### Healthcare Compliance
- Use synthetic data only for demo
- Log sanitization (no PHI in logs)
- HTTPS enforcement
- Data retention policies

---

## 🐛 Troubleshooting Guide

### Common Issues
1. **OpenAI API Rate Limits**
   - Implement retry with exponential backoff
   - Cache responses when possible
   - Monitor API usage dashboard

2. **Railway Deployment Errors**
   - Check logs: `railway logs`
   - Verify environment variables
   - Check start command in railway.json

3. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check PostgreSQL service status
   - Review connection pool settings

4. **CORS Errors**
   - Verify CORS_ORIGINS environment variable
   - Check Netlify deploy URL matches CORS config
   - Test with browser dev tools

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] OpenAI API key obtained and tested
- [ ] Railway account created
- [ ] Environment variables configured
- [ ] Database schema updated for production
- [ ] CORS origins configured for Netlify domain

### Backend Deployment
- [ ] Railway project created and connected to GitHub
- [ ] Environment variables set in Railway dashboard
- [ ] Database initialized with schema
- [ ] Demo data populated
- [ ] API endpoints tested with Postman/curl

### Frontend Updates
- [ ] API URL updated to Railway backend
- [ ] Environment variables set in Netlify
- [ ] Build and deploy successful
- [ ] Frontend-backend connectivity verified

### Testing
- [ ] All clinical modules functional
- [ ] AI Q&A working with OpenAI
- [ ] SOAP note generation tested
- [ ] Canvas layouts saving/loading correctly
- [ ] Cross-browser testing completed

### Production Readiness
- [ ] Error handling and logging implemented
- [ ] Performance monitoring setup
- [ ] API rate limiting configured
- [ ] Security headers implemented
- [ ] Documentation updated with new URLs

---

This comprehensive plan will guide you through migrating from local Ollama to OpenAI API and deploying your backend on Railway while keeping your frontend on Netlify.