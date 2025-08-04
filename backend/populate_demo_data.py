"""
Demo Data Population Script
Populates the SQLite database with demo patient cases
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime, date
import uuid

# Database path
DB_PATH = Path(__file__).parent.parent / "data" / "clinical_canvas.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    return conn

def populate_uncle_tan():
    """Populate Uncle Tan case - the main demo patient"""
    conn = get_connection()
    
    # Patient data
    patient_id = "uncle-tan-001"
    conn.execute("""
        INSERT OR REPLACE INTO patients (id, name, age, gender, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (patient_id, "Uncle Tan", 68, "Male", datetime.now(), datetime.now()))
    
    # AI Summary
    summary_id = str(uuid.uuid4())
    summary_text = """68-year-old male with progressive chronic kidney disease (Stage 4) requiring urgent nephrology follow-up. Recent labs show elevated creatinine (4.2 mg/dL) and declining eGFR (18 mL/min). Patient presents with fatigue, decreased appetite, and mild edema. Blood pressure moderately controlled on ACE inhibitor. Requires discussion of renal replacement therapy options and close monitoring of electrolytes and fluid status."""
    
    conn.execute("""
        INSERT OR REPLACE INTO ai_summaries (id, patient_id, summary_type, summary_text, confidence_score, generated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (summary_id, patient_id, "clinical", summary_text, 0.92, datetime.now()))
    
    # Clinical data - Vitals
    vitals_data = [
        ("blood_pressure_systolic", "142", "mmHg", "90-140", "2024-07-28"),
        ("blood_pressure_diastolic", "88", "mmHg", "60-90", "2024-07-28"),
        ("heart_rate", "78", "bpm", "60-100", "2024-07-28"),
        ("temperature", "36.8", "°C", "36.1-37.2", "2024-07-28"),
        ("weight", "72.5", "kg", "N/A", "2024-07-28"),
        ("oxygen_saturation", "98", "%", "95-100", "2024-07-28")
    ]
    
    for name, value, unit, ref_range, record_date in vitals_data:
        vital_id = str(uuid.uuid4())
        conn.execute("""
            INSERT OR REPLACE INTO clinical_data (id, patient_id, data_type, name, value, unit, reference_range, date_recorded, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (vital_id, patient_id, "vital", name, value, unit, ref_range, record_date, datetime.now()))
    
    # Clinical data - Lab Results
    lab_data = [
        ("creatinine", "4.2", "mg/dL", "0.7-1.3", "2024-07-28"),
        ("bun", "68", "mg/dL", "6-24", "2024-07-28"),
        ("egfr", "18", "mL/min/1.73m²", ">60", "2024-07-28"),
        ("potassium", "4.8", "mEq/L", "3.5-5.1", "2024-07-28"),
        ("phosphorus", "5.2", "mg/dL", "2.5-4.5", "2024-07-28"),
        ("hemoglobin", "10.2", "g/dL", "12.0-15.5", "2024-07-28"),
        ("parathyroid_hormone", "185", "pg/mL", "15-65", "2024-07-25"),
        ("albumin", "3.2", "g/dL", "3.5-5.0", "2024-07-28")
    ]
    
    for name, value, unit, ref_range, record_date in lab_data:
        lab_id = str(uuid.uuid4())
        conn.execute("""
            INSERT OR REPLACE INTO clinical_data (id, patient_id, data_type, name, value, unit, reference_range, date_recorded, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (lab_id, patient_id, "lab", name, value, unit, ref_range, record_date, datetime.now()))
    
    # Documents
    doc_id = str(uuid.uuid4())
    conn.execute("""
        INSERT OR REPLACE INTO documents (id, patient_id, filename, document_type, file_path, file_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (doc_id, patient_id, "referral_nephrology_tan.pdf", "referral", "/data/documents/uncle_tan_referral.pdf", "#", datetime.now()))
    
    # Pre-computed Q&A pairs
    qa_pairs = [
        {
            "question": "What is the current kidney function status?",
            "answer": "Uncle Tan has Stage 4 chronic kidney disease with severely reduced kidney function. His creatinine is elevated at 4.2 mg/dL (normal 0.7-1.3) and his estimated GFR is only 18 mL/min/1.73m² (normal >60), indicating severe reduction in kidney function.",
            "confidence": 0.95
        },
        {
            "question": "What are the main concerns with this patient?",
            "answer": "The primary concerns are: 1) Progressive chronic kidney disease requiring urgent nephrology evaluation, 2) Elevated creatinine and very low eGFR indicating need for renal replacement therapy planning, 3) Secondary complications including anemia (Hgb 10.2) and elevated parathyroid hormone (185), 4) Risk of fluid and electrolyte imbalances.",
            "confidence": 0.92
        },
        {
            "question": "What immediate actions are needed?",
            "answer": "Immediate actions include: 1) Urgent nephrology referral for renal replacement therapy discussion, 2) Close monitoring of electrolytes, especially potassium and phosphorus, 3) Fluid status assessment and management, 4) Blood pressure optimization, 5) Anemia management evaluation, 6) Patient education about kidney disease progression.",
            "confidence": 0.90
        }
    ]
    
    for qa in qa_pairs:
        qa_id = str(uuid.uuid4())
        conn.execute("""
            INSERT OR REPLACE INTO qa_pairs (id, patient_id, question, answer, source_document_id, confidence_score, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (qa_id, patient_id, qa["question"], qa["answer"], doc_id, qa["confidence"], datetime.now()))
    
    # Canvas Layout - Pre-designed layout for Uncle Tan
    canvas_nodes = [
        {
            "id": "patient-summary",
            "type": "patientSummary",
            "position": {"x": 50, "y": 50},
            "data": {
                "patientName": "Uncle Tan",
                "age": 68,
                "urgencyLevel": "high",
                "summary": summary_text
            }
        },
        {
            "id": "vitals-chart",
            "type": "vitalsChart", 
            "position": {"x": 400, "y": 50},
            "data": {
                "chartType": "trend",
                "vitalsData": vitals_data
            }
        },
        {
            "id": "lab-results",
            "type": "labResults",
            "position": {"x": 50, "y": 300},
            "data": {
                "labData": lab_data,
                "abnormalFlags": ["creatinine", "bun", "egfr", "phosphorus", "hemoglobin", "parathyroid_hormone"]
            }
        },
        {
            "id": "document-viewer",
            "type": "documentViewer",
            "position": {"x": 400, "y": 300},
            "data": {
                "documentName": "Nephrology Referral",
                "documentUrl": "/documents/uncle_tan_referral.pdf",
                "pageCount": 3
            }
        },
        {
            "id": "ai-question-box",
            "type": "aiQuestionBox",
            "position": {"x": 750, "y": 50},
            "data": {
                "lastQuestion": "What is the current kidney function status?",
                "lastAnswer": qa_pairs[0]["answer"]
            }
        },
        {
            "id": "soap-generator",
            "type": "SOAPGenerator",
            "position": {"x": 750, "y": 300},
            "data": {
                "patientId": patient_id,
                "patientName": "Uncle Tan"
            }
        },
        {
            "id": "patient-timeline",
            "type": "Timeline",
            "position": {"x": 50, "y": 550},
            "data": {
                "patientId": patient_id,
                "patientName": "Uncle Tan"
            }
        }
    ]
    
    layout_id = str(uuid.uuid4())
    conn.execute("""
        INSERT OR REPLACE INTO canvas_layouts (id, patient_id, layout_name, viewport_x, viewport_y, viewport_zoom, nodes, connections, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (layout_id, patient_id, "default", 0, 0, 1.0, json.dumps(canvas_nodes), json.dumps([]), datetime.now(), datetime.now()))
    
    conn.commit()
    conn.close()
    print("Uncle Tan case populated successfully")

def populate_mrs_chen():
    """Populate Mrs. Chen case - diabetes patient"""
    conn = get_connection()
    
    patient_id = "mrs-chen-002"
    conn.execute("""
        INSERT OR REPLACE INTO patients (id, name, age, gender, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (patient_id, "Mrs. Chen", 54, "Female", datetime.now(), datetime.now()))
    
    # AI Summary
    summary_text = """54-year-old female with Type 2 diabetes mellitus, moderately controlled with HbA1c of 8.2%. Recent concerns include diabetic nephropathy with microalbuminuria and early retinopathy changes. Blood pressure elevated at 150/92, requiring optimization. Patient reports improved dietary compliance but struggles with medication adherence. Requires endocrinology follow-up and ophthalmology screening."""
    
    summary_id = str(uuid.uuid4())
    conn.execute("""
        INSERT OR REPLACE INTO ai_summaries (id, patient_id, summary_type, summary_text, confidence_score, generated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (summary_id, patient_id, "clinical", summary_text, 0.89, datetime.now()))
    
    # Create comprehensive canvas layout for Mrs. Chen
    canvas_nodes = [
        {
            "id": "patient-summary",
            "type": "patientSummary",
            "position": {"x": 50, "y": 50},
            "data": {
                "patientName": "Mrs. Chen",
                "age": 54,
                "urgencyLevel": "medium",
                "summary": summary_text
            }
        },
        {
            "id": "soap-generator",
            "type": "SOAPGenerator",
            "position": {"x": 450, "y": 50},
            "data": {
                "patientId": patient_id,
                "patientName": "Mrs. Chen"
            }
        },
        {
            "id": "patient-timeline",
            "type": "Timeline",
            "position": {"x": 50, "y": 350},
            "data": {
                "patientId": patient_id,
                "patientName": "Mrs. Chen"
            }
        }
    ]
    
    layout_id = str(uuid.uuid4())
    conn.execute("""
        INSERT OR REPLACE INTO canvas_layouts (id, patient_id, layout_name, viewport_x, viewport_y, viewport_zoom, nodes, connections, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (layout_id, patient_id, "default", 0, 0, 1.0, json.dumps(canvas_nodes), json.dumps([]), datetime.now(), datetime.now()))
    
    conn.commit()
    conn.close()
    print("Mrs. Chen case populated successfully")

def populate_mr_kumar():
    """Populate Mr. Kumar case - cardiovascular patient"""
    conn = get_connection()
    
    patient_id = "mr-kumar-003"
    conn.execute("""
        INSERT OR REPLACE INTO patients (id, name, age, gender, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (patient_id, "Mr. Kumar", 61, "Male", datetime.now(), datetime.now()))
    
    # AI Summary
    summary_text = """61-year-old male with recent acute myocardial infarction (STEMI) 3 weeks ago, status post primary PCI with drug-eluting stent to LAD. Currently on dual antiplatelet therapy, statin, and ACE inhibitor. Echo shows mild LV dysfunction with EF 45%. Patient reports stable angina with mild exertion. Requires cardiac rehabilitation referral and close cardiology follow-up."""
    
    summary_id = str(uuid.uuid4())
    conn.execute("""
        INSERT OR REPLACE INTO ai_summaries (id, patient_id, summary_type, summary_text, confidence_score, generated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (summary_id, patient_id, "clinical", summary_text, 0.91, datetime.now()))
    
    # Create comprehensive canvas layout for Mr. Kumar
    canvas_nodes = [
        {
            "id": "patient-summary",
            "type": "patientSummary",
            "position": {"x": 50, "y": 50},
            "data": {
                "patientName": "Mr. Kumar",
                "age": 61,
                "urgencyLevel": "medium",
                "summary": summary_text
            }
        },
        {
            "id": "soap-generator",
            "type": "SOAPGenerator",
            "position": {"x": 450, "y": 50},
            "data": {
                "patientId": patient_id,
                "patientName": "Mr. Kumar"
            }
        },
        {
            "id": "patient-timeline",
            "type": "Timeline",
            "position": {"x": 50, "y": 350},
            "data": {
                "patientId": patient_id,
                "patientName": "Mr. Kumar"
            }
        }
    ]
    
    layout_id = str(uuid.uuid4())
    conn.execute("""
        INSERT OR REPLACE INTO canvas_layouts (id, patient_id, layout_name, viewport_x, viewport_y, viewport_zoom, nodes, connections, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (layout_id, patient_id, "default", 0, 0, 1.0, json.dumps(canvas_nodes), json.dumps([]), datetime.now(), datetime.now()))
    
    conn.commit()
    conn.close()
    print("Mr. Kumar case populated successfully")

def main():
    """Populate all demo patients"""
    print("Populating demo patient data...")
    
    try:
        populate_uncle_tan()
        populate_mrs_chen()
        populate_mr_kumar()
        print("\nAll demo patients populated successfully!")
        print("Available patients:")
        print("  - Uncle Tan (uncle-tan-001) - CKD Stage 4")
        print("  - Mrs. Chen (mrs-chen-002) - Type 2 Diabetes")
        print("  - Mr. Kumar (mr-kumar-003) - Post-MI")
        
    except Exception as e:
        print(f"Error populating data: {e}")
        raise

if __name__ == "__main__":
    main()