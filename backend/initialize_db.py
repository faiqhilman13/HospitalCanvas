"""
Initialize database with schema
"""
import sqlite3
from pathlib import Path
import os

# Database path
DB_PATH = Path(__file__).parent.parent / "data" / "clinical_canvas.db"

def init_database():
    """Initialize SQLite database with schema"""
    # Ensure data directory exists
    os.makedirs(DB_PATH.parent, exist_ok=True)
    
    # Read schema file
    schema_path = Path(__file__).parent.parent / "data" / "schemas" / "database_schema.sql"
    with open(schema_path, 'r') as f:
        schema_sql = f.read()
    
    # Initialize database
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(schema_sql)
    conn.commit()
    conn.close()
    print(f"Database initialized at: {DB_PATH}")

if __name__ == "__main__":
    init_database()