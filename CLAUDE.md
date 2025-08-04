# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-Powered Clinical Canvas - An interactive, canvas-based clinical intelligence platform that transforms complex patient documents into visual dashboards for healthcare professionals. The system combines OCR, semantic search, LLMs, and visual workflows to reduce clinical admin burden and support faster decision-making.

## Architecture

This is a multi-service application with three main components:

### Frontend (React + TypeScript)
- **Technology**: React 19.1 + TypeScript + Vite + Tailwind CSS 4
- **Canvas Library**: @xyflow/react for drag-and-drop clinical modules  
- **State Management**: Zustand store pattern
- **Data Fetching**: TanStack React Query
- **Charts**: Chart.js with react-chartjs-2
- **Location**: `frontend/`

### Backend (FastAPI + SQLite)
- **Technology**: FastAPI + Pydantic + SQLite
- **Purpose**: Serves patient data, handles file uploads, AI Q&A endpoints
- **Database**: SQLite with clinical data schema
- **Location**: `backend/`

### AI Pipeline (Python)
- **Technology**: Sentence transformers + FAISS + PDF processing
- **Purpose**: Document processing, embeddings, RAG pipeline
- **Models**: BAAI/bge-large-en-v1.5 for embeddings, local LLM via Ollama
- **Location**: `ai-pipeline/`

## Development Commands

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev         # Start development server (Vite)
npm run build       # Build for production (TypeScript + Vite)
npm run lint        # Run ESLint
npm run preview     # Preview production build
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt    # Install Python dependencies
uvicorn main:app --reload          # Start FastAPI server with hot reload
python initialize_db.py            # Initialize SQLite database
python populate_demo_data.py       # Load demo patient data
```

### AI Pipeline
```bash
cd ai-pipeline
pip install -r requirements.txt    # Install AI/ML dependencies
python document_processor.py       # Process clinical documents
python rag_pipeline.py            # Initialize RAG system
```

## Key Architectural Patterns

### Canvas System
The core UI is built around a modular canvas system using @xyflow/react:
- **Node Types**: PatientSummary, VitalsChart, DocumentViewer, AIQuestionBox, LabResults, Timeline, SOAPGenerator
- **Layout Persistence**: Canvas layouts stored per patient in SQLite
- **Real-time Updates**: React Query for data synchronization

### Type System
Comprehensive TypeScript definitions in `frontend/src/types/index.ts`:
- **Clinical Data**: Patient, VitalSign, LabTest, ClinicalData interfaces
- **Canvas Types**: CanvasNode, CanvasLayout, CanvasViewport for UI state
- **API Types**: Standardized request/response patterns

### Data Flow
1. **Patient Selection** → Load canvas layout from SQLite
2. **Canvas Modules** → Fetch data via FastAPI endpoints  
3. **AI Q&A** → RAG pipeline queries document embeddings
4. **SOAP Generation** → LLM processes clinical data into structured notes

### Store Architecture
Zustand-based state management in `frontend/src/stores/canvasStore.ts`:
- Patient data and canvas state
- Viewport and node management
- Real-time canvas updates

## Database Schema

SQLite database with clinical-focused schema:
- **patients**: Core patient information
- **documents**: Clinical document metadata
- **canvas_layouts**: Serialized canvas configurations
- **vitals_data**: Time-series vital signs
- **lab_results**: Laboratory test results
- **qa_pairs**: AI-generated Q&A responses

## AI Integration Points

### Document Processing Pipeline
1. PDF parsing with pdfplumber
2. Text chunking and embedding generation
3. FAISS vector storage for semantic search
4. Reranking with cross-encoder models

### LLM Integration
- **Local LLM**: Ollama for privacy-focused deployment
- **Prompt Templates**: Patient summarization, SOAP note generation, Q&A
- **Citation System**: Source document references with page numbers

## Component Development Patterns

### Canvas Nodes
Each clinical module follows the pattern:
```typescript
interface [NodeType]NodeData {
  // Node-specific data structure
}

const [NodeType]Node: React.FC<CanvasNodeProps> = ({ id, data }) => {
  // Node implementation with drag/resize capabilities
}
```

### Hooks Pattern
Custom hooks for data fetching:
- `usePatientData.ts`: Patient information and clinical data
- `usePatients.ts`: Patient list and selection
- `useSOAPNotes.ts`: SOAP note generation and management

## Privacy & Security Notes
- All demo data is 100% synthetic
- No real PHI (Protected Health Information) used
- File uploads handled securely through FastAPI
- Canvas layouts encrypted in database storage

## Demo Patient Data
Pre-loaded synthetic patients for development:
- **Uncle Tan**: 65-year-old with kidney function decline
- **Mrs. Chen**: Diabetes management case  
- **Mr. Kumar**: Cardiovascular risk assessment