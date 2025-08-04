"""
Database Migration Script - Update existing database schema for analytics features
"""

import sqlite3
import json
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent.parent / "data" / "clinical_canvas.db"

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def check_column_exists(conn, table_name, column_name):
    """Check if a column exists in a table"""
    cursor = conn.execute(f"PRAGMA table_info({table_name})")
    columns = [column[1] for column in cursor.fetchall()]
    return column_name in columns

def migrate_canvas_layouts():
    """Add user_role column to canvas_layouts table"""
    conn = get_db_connection()
    try:
        # Check if user_role column exists
        if not check_column_exists(conn, 'canvas_layouts', 'user_role'):
            print("Adding user_role column to canvas_layouts table...")
            conn.execute("ALTER TABLE canvas_layouts ADD COLUMN user_role TEXT DEFAULT 'clinician'")
            conn.commit()
            print("Added user_role column successfully")
        else:
            print("user_role column already exists")
            
        # Add indexes
        try:
            conn.execute("CREATE INDEX IF NOT EXISTS idx_canvas_role ON canvas_layouts(user_role)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_canvas_patient_role ON canvas_layouts(patient_id, user_role)")
            conn.commit()
            print("Canvas layout indexes created")
        except Exception as e:
            print(f"Index creation warning: {e}")
            
    except Exception as e:
        print(f"Error migrating canvas_layouts: {e}")
    finally:
        conn.close()

def create_new_tables():
    """Create new analytics tables"""
    conn = get_db_connection()
    try:
        # User roles table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_roles (
                id TEXT PRIMARY KEY,
                role_name TEXT UNIQUE NOT NULL,
                display_name TEXT NOT NULL,
                description TEXT,
                default_permissions JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Population metrics table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS population_metrics (
                id TEXT PRIMARY KEY,
                metric_name TEXT NOT NULL,
                metric_type TEXT NOT NULL,
                metric_value TEXT NOT NULL,
                time_period TEXT,
                calculated_date DATE NOT NULL,
                patient_count INTEGER,
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Disease patterns table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS disease_patterns (
                id TEXT PRIMARY KEY,
                pattern_name TEXT NOT NULL,
                pattern_type TEXT NOT NULL,
                condition_codes JSON,
                affected_patients JSON,
                pattern_data JSON NOT NULL,
                confidence_score REAL,
                time_range_start DATE,
                time_range_end DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Medication analytics table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS medication_analytics (
                id TEXT PRIMARY KEY,
                medication_name TEXT NOT NULL,
                medication_class TEXT,
                usage_pattern TEXT NOT NULL,
                analytics_data JSON NOT NULL,
                patient_count INTEGER,
                time_period TEXT,
                calculated_date DATE NOT NULL,
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Layout templates table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS layout_templates (
                id TEXT PRIMARY KEY,
                template_name TEXT NOT NULL,
                user_role TEXT NOT NULL,
                template_description TEXT,
                default_nodes JSON NOT NULL,
                default_connections JSON,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create indexes for new tables
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_population_metrics_date ON population_metrics(calculated_date)",
            "CREATE INDEX IF NOT EXISTS idx_population_metrics_type ON population_metrics(metric_type)",
            "CREATE INDEX IF NOT EXISTS idx_disease_patterns_type ON disease_patterns(pattern_type)",
            "CREATE INDEX IF NOT EXISTS idx_disease_patterns_updated ON disease_patterns(updated_at)",
            "CREATE INDEX IF NOT EXISTS idx_medication_analytics_name ON medication_analytics(medication_name)",
            "CREATE INDEX IF NOT EXISTS idx_medication_analytics_date ON medication_analytics(calculated_date)",
            "CREATE INDEX IF NOT EXISTS idx_layout_templates_role ON layout_templates(user_role)"
        ]
        
        for index in indexes:
            try:
                conn.execute(index)
            except Exception as e:
                print(f"Index warning: {e}")
        
        conn.commit()
        print("New analytics tables created successfully")
        
    except Exception as e:
        print(f"Error creating new tables: {e}")
    finally:
        conn.close()

def main():
    """Run database migration"""
    print("Starting database migration...")
    
    migrate_canvas_layouts()
    create_new_tables()
    
    print("Database migration completed!")

if __name__ == "__main__":
    main()