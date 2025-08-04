# AI-Powered Clinical Canvas

A canvas-based clinical intelligence platform that transforms complex patient documents into interactive, visual dashboards for healthcare professionals.

## 🎯 Project Overview

This hackathon demo showcases how AI can instantly transform a 15-page clinical referral into an interactive canvas with:
- AI-generated patient summaries
- Visual trend charts for vitals and labs
- Natural language Q&A with source citations
- Drag-and-drop canvas interface like Excalidraw/Miro

## 🏗️ Architecture

```
├── frontend/          # React + TypeScript + react-flow canvas
├── backend/           # FastAPI + SQLite + AI integration
├── ai-pipeline/       # Document processing + embeddings
├── data/             # Demo patient data + schemas
└── PRD.md           # Product Requirements Document
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Ollama (for local AI)

### Development Setup

1. **Frontend (React Canvas)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend (FastAPI)**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **AI Pipeline**
   ```bash
   cd ai-pipeline
   pip install -r requirements.txt
   python preprocess_demo_data.py
   ```

## 🎪 Demo Features

- **Instant Canvas Load**: Pre-computed patient data loads in <1 second
- **Interactive Canvas**: Drag, resize, and arrange clinical modules
- **AI Q&A**: Ask questions and get answers with source citations
- **Visual Trends**: Charts showing patient vitals and lab results
- **Document Integration**: PDF viewer with AI-highlighted sections

## 📊 Demo Patients

- **Uncle Tan**: 65-year-old with declining kidney function
- **Mrs. Chen**: Diabetes management case
- **Mr. Kumar**: Cardiovascular risk assessment

## 🚀 Deployment

- **Frontend**: Netlify (static React build)
- **Backend**: Railway (FastAPI + SQLite)
- **Demo**: Publicly accessible at [URL]

## 🔐 Privacy Note

All demo data is 100% synthetic and created specifically for this hackathon. No real patient health information (PHI) is used.