# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-Powered Clinical Canvas is a full-stack web application that transforms complex clinical documents into interactive, visual dashboards. It demonstrates a React Flow-based canvas with AI-powered Q&A capabilities for healthcare professionals.

**Architecture**: 3-tier system with React frontend → FastAPI backend → AI pipeline (RAG system)

## Development Commands

### Frontend (React + TypeScript)
```bash
cd frontend
bun install          # Install dependencies
bun run dev          # Start development server (localhost:5173)
bun run build        # Build for production
bun run lint         # Run ESLint
bun run preview      # Preview production build
```

### Backend (FastAPI + SQLite)
```bash
cd backend
pip install -r requirements.txt
python -c "import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=False)"  # Start server
python initialize_db.py          # Initialize database schema
python populate_demo_data.py     # Populate with demo patients
```

### AI Pipeline (RAG System)
```bash
cd ai-pipeline
pip install -r requirements.txt
python rag_pipeline.py          # Test RAG system
python ollama_client.py         # Test Ollama integration
python document_processor.py    # Test document processing
```

### Full System Startup
1. Backend: `cd backend && python -c "import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=False)"`
2. Frontend: `cd frontend && bun run dev`
3. Access: http://localhost:5173

## High-Level Architecture

### Data Flow
```
PDF Documents → AI Pipeline → SQLite → FastAPI → React Canvas
```

### Core Components

**Frontend**: 
- **Canvas System**: React Flow-based interactive canvas with 5 custom node types
- **State Management**: Zustand store for canvas state, React Query for API data
- **Custom Nodes**: PatientSummaryNode, VitalsChartNode, DocumentViewerNode, AIQuestionBoxNode, LabResultsNode
- **Type Safety**: Comprehensive TypeScript interfaces in `frontend/src/types/index.ts`

**Backend**:
- **API Layer**: FastAPI with 3 core endpoints: `/api/patients`, `/api/patients/{id}`, `/api/patients/{id}/ask`
- **Database**: SQLite with 8 tables (patients, documents, canvas_layouts, ai_summaries, clinical_data, qa_pairs, document_embeddings)
- **AI Integration**: RAG pipeline integration with fallback to pre-computed Q&A pairs
- **CORS**: Configured for frontend-backend communication

**AI Pipeline**:
- **RAG System**: Document processing → embedding generation → retrieval → LLM generation
- **Ollama Integration**: Local LLaMA 3 model support with fallback mechanisms
- **Document Processing**: PDF text extraction, chunking, and relevance scoring
- **Clinical Context**: Patient data integration for contextual Q&A responses

### Key Files to Understand

**Frontend Architecture**:
- `frontend/src/types/index.ts` - Complete type definitions for the entire system
- `frontend/src/components/ClinicalCanvas.tsx` - Main canvas component orchestrating React Flow
- `frontend/src/hooks/usePatientData.ts` - API integration with data transformation layer
- `frontend/src/stores/canvasStore.ts` - Canvas state management

**Backend Architecture**:
- `backend/main.py` - FastAPI app with all endpoints and RAG integration
- `data/schemas/database_schema.sql` - Complete database schema with relationships
- `backend/populate_demo_data.py` - Demo data generation with realistic clinical cases

**AI Pipeline Architecture**:
- `ai-pipeline/rag_pipeline.py` - Core RAG system orchestrating retrieval and generation
- `ai-pipeline/ollama_client.py` - LLM client with clinical question handling
- `ai-pipeline/document_processor.py` - PDF processing and text chunking

### Demo Patients
- **Uncle Tan** (uncle-tan-001): Stage 4 CKD with comprehensive data and Q&A pairs
- **Mrs. Chen** (mrs-chen-002): Type 2 diabetes case
- **Mr. Kumar** (mr-kumar-003): Post-MI cardiovascular case

### Canvas Node System
React Flow nodes are custom components with standardized interfaces:
- Each node type has dedicated TypeScript interfaces in `types/index.ts`
- Nodes receive data through the `data` prop and handle their own rendering
- Canvas layouts are stored as JSON in the database and loaded dynamically
- Node interactions (drag, resize) are handled by React Flow with custom handles

### AI Q&A System
The Q&A system uses a layered approach:
1. **Pre-computed answers**: Database lookup for common questions (demo reliability)
2. **RAG pipeline**: Document retrieval + LLM generation for new questions
3. **Fallback responses**: Basic responses when AI systems are unavailable

### Database Design
SQLite database with clinical data normalization:
- **patients** → **documents** → **document_embeddings** (for RAG)
- **patients** → **clinical_data** (vitals/labs with temporal data)
- **patients** → **canvas_layouts** (JSON storage of React Flow layouts)
- **patients** → **qa_pairs** (pre-computed Q&A for demo reliability)

### Error Handling Strategy
- Frontend: Graceful API failures with fallback to mock data
- Backend: Try RAG → fallback to database Q&A → basic response
- AI Pipeline: Ollama unavailable → use pre-computed responses

### Performance Considerations
- Canvas layouts are pre-computed and stored as JSON for instant loading
- Demo data is populated at startup for reliable performance
- Frontend uses React Query for caching and optimistic updates
- AI responses have confidence scoring for user trust

This architecture prioritizes demo reliability while showcasing production-ready patterns for clinical AI applications.