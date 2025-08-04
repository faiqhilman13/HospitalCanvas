"""
Seed Analytics Data - Populate demo data for population analytics and role-based features
"""

import sqlite3
import json
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent.parent / "data" / "clinical_canvas.db"

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def seed_user_roles():
    """Seed basic user roles"""
    conn = get_db_connection()
    try:
        roles_data = [
            {
                "id": str(uuid.uuid4()),
                "role_name": "clinician",
                "display_name": "Clinician",
                "description": "Healthcare professionals providing direct patient care",
                "default_permissions": json.dumps(["view_patients", "create_soap_notes", "view_documents"])
            },
            {
                "id": str(uuid.uuid4()),
                "role_name": "analyst",
                "display_name": "Data Analyst",
                "description": "Healthcare analysts focusing on population health trends",
                "default_permissions": json.dumps(["view_analytics", "view_population_data", "generate_reports"])
            },
            {
                "id": str(uuid.uuid4()),
                "role_name": "admin",
                "display_name": "Administrator", 
                "description": "System administrators with full access",
                "default_permissions": json.dumps(["admin_access", "manage_users", "system_settings"])
            }
        ]
        
        for role in roles_data:
            conn.execute("""
                INSERT OR REPLACE INTO user_roles (id, role_name, display_name, description, default_permissions)
                VALUES (?, ?, ?, ?, ?)
            """, (role["id"], role["role_name"], role["display_name"], role["description"], role["default_permissions"]))
        
        conn.commit()
        print("User roles seeded successfully")
        
    except Exception as e:
        print(f"Error seeding user roles: {e}")
    finally:
        conn.close()

def seed_layout_templates():
    """Seed layout templates for different roles"""
    conn = get_db_connection()
    try:
        # Clinician layout template
        clinician_nodes = [
            {
                "id": "node-patient-summary",
                "type": "patientSummary",
                "position": {"x": 100, "y": 100},
                "data": {"title": "Patient Summary", "width": 400, "height": 300}
            },
            {
                "id": "node-vitals-chart", 
                "type": "vitalsChart",
                "position": {"x": 550, "y": 100},
                "data": {"title": "Vital Signs", "width": 400, "height": 300}
            },
            {
                "id": "node-soap-generator",
                "type": "soapGenerator", 
                "position": {"x": 100, "y": 450},
                "data": {"title": "SOAP Notes", "width": 500, "height": 350}
            },
            {
                "id": "node-lab-results",
                "type": "labResults",
                "position": {"x": 650, "y": 450}, 
                "data": {"title": "Lab Results", "width": 400, "height": 300}
            }
        ]
        
        # Analyst layout template
        analyst_nodes = [
            {
                "id": "node-analytics-dashboard",
                "type": "analyticsDashboard",
                "position": {"x": 100, "y": 100},
                "data": {"title": "Population Analytics", "width": 600, "height": 400}
            },
            {
                "id": "node-disease-patterns",
                "type": "diseasePatterns",
                "position": {"x": 750, "y": 100},
                "data": {"title": "Disease Patterns", "width": 400, "height": 300}
            },
            {
                "id": "node-medication-trends",
                "type": "medicationTrends", 
                "position": {"x": 100, "y": 550},
                "data": {"title": "Medication Analytics", "width": 500, "height": 300}
            },
            {
                "id": "node-population-summary",
                "type": "populationSummary",
                "position": {"x": 650, "y": 550},
                "data": {"title": "Population Summary", "width": 400, "height": 250}
            }
        ]
        
        # Admin layout template
        admin_nodes = [
            {
                "id": "node-system-overview",
                "type": "systemOverview",
                "position": {"x": 100, "y": 100},
                "data": {"title": "System Overview", "width": 500, "height": 300}
            },
            {
                "id": "node-user-management",
                "type": "userManagement",
                "position": {"x": 650, "y": 100},
                "data": {"title": "User Management", "width": 400, "height": 300}
            },
            {
                "id": "node-system-logs",
                "type": "systemLogs",
                "position": {"x": 100, "y": 450},
                "data": {"title": "System Activity", "width": 450, "height": 300}
            },
            {
                "id": "node-performance-metrics",
                "type": "performanceMetrics",
                "position": {"x": 600, "y": 450},
                "data": {"title": "Performance Metrics", "width": 400, "height": 300}
            }
        ]
        
        templates_data = [
            {
                "id": str(uuid.uuid4()),
                "template_name": "Default Clinician Layout",
                "user_role": "clinician",
                "template_description": "Standard layout for clinical care with patient summary, vitals, SOAP notes, and lab results",
                "default_nodes": json.dumps(clinician_nodes),
                "default_connections": json.dumps([])
            },
            {
                "id": str(uuid.uuid4()),
                "template_name": "Default Analyst Layout", 
                "user_role": "analyst",
                "template_description": "Analytics-focused layout with population health metrics and trend analysis",
                "default_nodes": json.dumps(analyst_nodes),
                "default_connections": json.dumps([])
            },
            {
                "id": str(uuid.uuid4()),
                "template_name": "Default Admin Layout",
                "user_role": "admin", 
                "template_description": "Administrative dashboard with system management and monitoring tools",
                "default_nodes": json.dumps(admin_nodes),
                "default_connections": json.dumps([])
            }
        ]
        
        for template in templates_data:
            conn.execute("""
                INSERT OR REPLACE INTO layout_templates 
                (id, template_name, user_role, template_description, default_nodes, default_connections, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                template["id"], template["template_name"], template["user_role"], 
                template["template_description"], template["default_nodes"], 
                template["default_connections"], True
            ))
        
        conn.commit()
        print(" Layout templates seeded successfully")
        
    except Exception as e:
        print(f" Error seeding layout templates: {e}")
    finally:
        conn.close()

def seed_population_metrics():
    """Seed population health metrics"""
    conn = get_db_connection()
    try:
        base_date = datetime.now() - timedelta(days=30)
        metrics_data = []
        
        # Generate metrics for the last 30 days
        for i in range(30):
            current_date = base_date + timedelta(days=i)
            
            # Average patient age
            metrics_data.append({
                "id": str(uuid.uuid4()),
                "metric_name": "average_patient_age",
                "metric_type": "aggregate",
                "metric_value": json.dumps({"value": 58.2 + (i * 0.1), "unit": "years"}),
                "time_period": "daily",
                "calculated_date": current_date.strftime("%Y-%m-%d"),
                "patient_count": 150 + i,
                "metadata": json.dumps({"source": "patient_demographics"})
            })
            
            # Common conditions
            if i % 7 == 0:  # Weekly metrics
                metrics_data.append({
                    "id": str(uuid.uuid4()),
                    "metric_name": "common_conditions",
                    "metric_type": "trend",
                    "metric_value": json.dumps({
                        "diabetes": 45 + (i % 10),
                        "hypertension": 78 + (i % 15),
                        "kidney_disease": 23 + (i % 8),
                        "cardiovascular": 34 + (i % 12)
                    }),
                    "time_period": "weekly",
                    "calculated_date": current_date.strftime("%Y-%m-%d"),
                    "patient_count": 150 + i,
                    "metadata": json.dumps({"source": "diagnosis_codes"})
                })
            
            # Medication adherence
            if i % 3 == 0:  # Every 3 days
                metrics_data.append({
                    "id": str(uuid.uuid4()),
                    "metric_name": "medication_adherence",
                    "metric_type": "trend",
                    "metric_value": json.dumps({"adherence_rate": 0.78 + (i * 0.002), "unit": "percentage"}),
                    "time_period": "daily",
                    "calculated_date": current_date.strftime("%Y-%m-%d"),
                    "patient_count": 120 + i,
                    "metadata": json.dumps({"source": "prescription_tracking"})
                })
        
        for metric in metrics_data:
            conn.execute("""
                INSERT OR REPLACE INTO population_metrics 
                (id, metric_name, metric_type, metric_value, time_period, calculated_date, patient_count, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                metric["id"], metric["metric_name"], metric["metric_type"], 
                metric["metric_value"], metric["time_period"], metric["calculated_date"],
                metric["patient_count"], metric["metadata"]
            ))
        
        conn.commit()
        print(f" Population metrics seeded successfully ({len(metrics_data)} records)")
        
    except Exception as e:
        print(f" Error seeding population metrics: {e}")
    finally:
        conn.close()

def seed_disease_patterns():
    """Seed disease patterns and trends"""
    conn = get_db_connection()
    try:
        patterns_data = [
            {
                "id": str(uuid.uuid4()),
                "pattern_name": "Diabetes Progression Pattern",
                "pattern_type": "chronic",
                "condition_codes": json.dumps(["E11.9", "E10.9", "E13.9"]),
                "affected_patients": json.dumps(["patient-1", "patient-2", "patient-3"]),
                "pattern_data": json.dumps({
                    "trend": "increasing",
                    "prevalence": 0.28,
                    "age_distribution": {"40-50": 15, "50-60": 25, "60-70": 35, "70+": 25},
                    "complications": ["nephropathy", "retinopathy", "neuropathy"],
                    "medication_response": {"metformin": 0.78, "insulin": 0.85}
                }),
                "confidence_score": 0.89,
                "time_range_start": (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
                "time_range_end": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "id": str(uuid.uuid4()),
                "pattern_name": "Hypertension Medication Response",
                "pattern_type": "medication_response",
                "condition_codes": json.dumps(["I10", "I11.9", "I12.9"]),
                "affected_patients": json.dumps(["patient-1", "patient-4", "patient-5"]),
                "pattern_data": json.dumps({
                    "trend": "stable",
                    "prevalence": 0.45,
                    "effectiveness": {
                        "ACE_inhibitors": 0.82,
                        "beta_blockers": 0.76,
                        "diuretics": 0.71
                    },
                    "side_effects": {"fatigue": 0.15, "dizziness": 0.12, "cough": 0.08}
                }),
                "confidence_score": 0.92,
                "time_range_start": (datetime.now() - timedelta(days=180)).strftime("%Y-%m-%d"),
                "time_range_end": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "id": str(uuid.uuid4()),
                "pattern_name": "Chronic Kidney Disease Progression",
                "pattern_type": "chronic",
                "condition_codes": json.dumps(["N18.3", "N18.4", "N18.5"]),
                "affected_patients": json.dumps(["patient-1", "patient-6"]),
                "pattern_data": json.dumps({
                    "trend": "declining",
                    "progression_rate": "moderate",
                    "stages": {"stage_3": 12, "stage_4": 8, "stage_5": 3},
                    "risk_factors": {"diabetes": 0.67, "hypertension": 0.78, "age": 0.45},
                    "interventions": {"diet_modification": 0.65, "medication": 0.82}
                }),
                "confidence_score": 0.87,
                "time_range_start": (datetime.now() - timedelta(days=270)).strftime("%Y-%m-%d"),
                "time_range_end": datetime.now().strftime("%Y-%m-%d")
            }
        ]
        
        for pattern in patterns_data:
            conn.execute("""
                INSERT OR REPLACE INTO disease_patterns 
                (id, pattern_name, pattern_type, condition_codes, affected_patients, pattern_data, 
                 confidence_score, time_range_start, time_range_end)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pattern["id"], pattern["pattern_name"], pattern["pattern_type"],
                pattern["condition_codes"], pattern["affected_patients"], pattern["pattern_data"],
                pattern["confidence_score"], pattern["time_range_start"], pattern["time_range_end"]
            ))
        
        conn.commit()
        print(f" Disease patterns seeded successfully ({len(patterns_data)} records)")
        
    except Exception as e:
        print(f" Error seeding disease patterns: {e}")
    finally:
        conn.close()

def seed_medication_analytics():
    """Seed medication usage analytics"""
    conn = get_db_connection()
    try:
        medications_data = [
            {
                "id": str(uuid.uuid4()),
                "medication_name": "Metformin",
                "medication_class": "Biguanides",
                "usage_pattern": "prescribing_trends",
                "analytics_data": json.dumps({
                    "total_prescriptions": 245,
                    "monthly_trend": [20, 22, 25, 28, 24, 26],
                    "dosage_distribution": {"500mg": 0.45, "850mg": 0.35, "1000mg": 0.20},
                    "effectiveness_rating": 0.82,
                    "side_effects": {"nausea": 0.15, "diarrhea": 0.12}
                }),
                "patient_count": 87,
                "time_period": "monthly",
                "calculated_date": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "id": str(uuid.uuid4()),
                "medication_name": "Lisinopril",
                "medication_class": "ACE Inhibitors",
                "usage_pattern": "adherence_rates",
                "analytics_data": json.dumps({
                    "adherence_rate": 0.78,
                    "improvement_trend": [0.72, 0.74, 0.76, 0.78],
                    "factors": {
                        "side_effects": 0.15,
                        "cost": 0.08,
                        "complexity": 0.12
                    },
                    "interventions": {"reminder_system": 0.65, "education": 0.58}
                }),
                "patient_count": 156,
                "time_period": "quarterly",
                "calculated_date": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "id": str(uuid.uuid4()),
                "medication_name": "Atorvastatin", 
                "medication_class": "Statins",
                "usage_pattern": "effectiveness",
                "analytics_data": json.dumps({
                    "cholesterol_reduction": 0.32,
                    "cardiovascular_events": {"reduced_by": 0.24},
                    "dosage_effectiveness": {
                        "10mg": 0.65,
                        "20mg": 0.78,
                        "40mg": 0.85
                    },
                    "monitoring_frequency": "quarterly"
                }),
                "patient_count": 198,
                "time_period": "yearly",
                "calculated_date": datetime.now().strftime("%Y-%m-%d")
            }
        ]
        
        for med in medications_data:
            conn.execute("""
                INSERT OR REPLACE INTO medication_analytics 
                (id, medication_name, medication_class, usage_pattern, analytics_data, 
                 patient_count, time_period, calculated_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                med["id"], med["medication_name"], med["medication_class"],
                med["usage_pattern"], med["analytics_data"], med["patient_count"],
                med["time_period"], med["calculated_date"]
            ))
        
        conn.commit()
        print(f" Medication analytics seeded successfully ({len(medications_data)} records)")
        
    except Exception as e:
        print(f" Error seeding medication analytics: {e}")
    finally:
        conn.close()

def main():
    """Run all seeding functions"""
    print(" Starting analytics data seeding...")
    
    seed_user_roles()
    seed_layout_templates()
    seed_population_metrics()
    seed_disease_patterns()
    seed_medication_analytics()
    
    print(" Analytics data seeding completed!")

if __name__ == "__main__":
    main()