-- AI-Powered Clinical Canvas Database Schema
-- SQLite schema for demo patient data and canvas layouts

-- Patients table - core patient information
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table - source clinical documents
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    document_type TEXT, -- 'referral', 'lab_report', 'discharge_summary'
    file_path TEXT,
    file_url TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Canvas layouts - pre-defined canvas configurations
CREATE TABLE IF NOT EXISTS canvas_layouts (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    layout_name TEXT DEFAULT 'default',
    viewport_x REAL DEFAULT 0,
    viewport_y REAL DEFAULT 0,
    viewport_zoom REAL DEFAULT 1,
    nodes JSON NOT NULL, -- JSON array of canvas nodes
    connections JSON, -- JSON array of node connections
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- AI summaries - generated patient summaries
CREATE TABLE IF NOT EXISTS ai_summaries (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    summary_type TEXT DEFAULT 'general', -- 'general', 'clinical', 'urgent'
    summary_text TEXT NOT NULL,
    confidence_score REAL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Vitals and labs data - structured clinical data
CREATE TABLE IF NOT EXISTS clinical_data (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    document_id TEXT,
    data_type TEXT NOT NULL, -- 'vital', 'lab', 'medication'
    name TEXT NOT NULL, -- 'blood_pressure', 'creatinine', 'glucose'
    value TEXT NOT NULL,
    unit TEXT,
    reference_range TEXT,
    date_recorded DATE,
    page_number INTEGER, -- source page in document
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (document_id) REFERENCES documents(id)
);

-- QA pairs - pre-computed question-answer pairs
CREATE TABLE IF NOT EXISTS qa_pairs (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    source_document_id TEXT,
    source_page INTEGER,
    source_text TEXT, -- exact text from document
    confidence_score REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (source_document_id) REFERENCES documents(id)
);

-- Document embeddings - vector embeddings for RAG
CREATE TABLE IF NOT EXISTS document_embeddings (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER,
    page_number INTEGER,
    embedding BLOB, -- serialized vector embedding
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id)
);

-- SOAP notes - structured clinical notes
CREATE TABLE IF NOT EXISTS soap_notes (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    subjective TEXT NOT NULL,
    objective TEXT NOT NULL,
    assessment TEXT NOT NULL,
    plan TEXT NOT NULL,
    generated_by TEXT NOT NULL, -- 'ai' or 'manual'
    confidence_score REAL DEFAULT 0.0,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_canvas_patient ON canvas_layouts(patient_id);
CREATE INDEX IF NOT EXISTS idx_summaries_patient ON ai_summaries(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_patient ON clinical_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_type ON clinical_data(data_type);
CREATE INDEX IF NOT EXISTS idx_qa_patient ON qa_pairs(patient_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_document ON document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_soap_patient ON soap_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_soap_date ON soap_notes(date);