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
    user_role TEXT DEFAULT 'clinician', -- 'clinician', 'analyst', 'admin'
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

-- User roles - available system roles
CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY,
    role_name TEXT UNIQUE NOT NULL, -- 'clinician', 'analyst', 'admin'
    display_name TEXT NOT NULL,
    description TEXT,
    default_permissions JSON, -- JSON array of permissions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Population health metrics - cross-patient analytics
CREATE TABLE IF NOT EXISTS population_metrics (
    id TEXT PRIMARY KEY,
    metric_name TEXT NOT NULL, -- 'avg_age', 'common_conditions', 'medication_adherence'
    metric_type TEXT NOT NULL, -- 'aggregate', 'trend', 'comparison'
    metric_value TEXT NOT NULL, -- JSON value (number, array, object)
    time_period TEXT, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    calculated_date DATE NOT NULL,
    patient_count INTEGER, -- number of patients included in calculation
    metadata JSON, -- additional metric metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disease patterns - clinical trend analysis
CREATE TABLE IF NOT EXISTS disease_patterns (
    id TEXT PRIMARY KEY,
    pattern_name TEXT NOT NULL, -- 'diabetes_progression', 'hypertension_trends'
    pattern_type TEXT NOT NULL, -- 'chronic', 'acute', 'medication_response'
    condition_codes JSON, -- ICD-10 or other condition codes
    affected_patients JSON, -- array of patient IDs
    pattern_data JSON NOT NULL, -- trend data, statistics, correlations
    confidence_score REAL, -- pattern confidence (0.0-1.0)
    time_range_start DATE,
    time_range_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication analytics - usage patterns and trends
CREATE TABLE IF NOT EXISTS medication_analytics (
    id TEXT PRIMARY KEY,
    medication_name TEXT NOT NULL,
    medication_class TEXT, -- drug class/category
    usage_pattern TEXT NOT NULL, -- 'prescribing_trends', 'adherence_rates', 'effectiveness'
    analytics_data JSON NOT NULL, -- usage statistics, trends, outcomes
    patient_count INTEGER, -- number of patients in analysis
    time_period TEXT, -- analysis time period
    calculated_date DATE NOT NULL,
    metadata JSON, -- additional analytics metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Layout templates - role-specific default layouts
CREATE TABLE IF NOT EXISTS layout_templates (
    id TEXT PRIMARY KEY,
    template_name TEXT NOT NULL,
    user_role TEXT NOT NULL, -- 'clinician', 'analyst', 'admin'
    template_description TEXT,
    default_nodes JSON NOT NULL, -- default canvas node configuration
    default_connections JSON, -- default node connections
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional indexes for new tables
CREATE INDEX IF NOT EXISTS idx_canvas_role ON canvas_layouts(user_role);
CREATE INDEX IF NOT EXISTS idx_canvas_patient_role ON canvas_layouts(patient_id, user_role);
CREATE INDEX IF NOT EXISTS idx_population_metrics_date ON population_metrics(calculated_date);
CREATE INDEX IF NOT EXISTS idx_population_metrics_type ON population_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_disease_patterns_type ON disease_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_disease_patterns_updated ON disease_patterns(updated_at);
CREATE INDEX IF NOT EXISTS idx_medication_analytics_name ON medication_analytics(medication_name);
CREATE INDEX IF NOT EXISTS idx_medication_analytics_date ON medication_analytics(calculated_date);
CREATE INDEX IF NOT EXISTS idx_layout_templates_role ON layout_templates(user_role);