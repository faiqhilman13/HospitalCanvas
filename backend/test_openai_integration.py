#!/usr/bin/env python3
"""
Test script for OpenAI integration in Clinical Canvas Backend

This script tests the OpenAI service implementation to ensure it works correctly
as a drop-in replacement for the existing Ollama integration.

Usage:
    python test_openai_integration.py

Prerequisites:
    1. Set OPENAI_API_KEY environment variable
    2. Install dependencies: pip install -r requirements.txt
    3. Initialize database: python initialize_db.py && python populate_demo_data.py
"""

import os
import sys
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

def test_openai_service():
    """Test OpenAI service functionality"""
    print("🧪 Testing OpenAI Service")
    print("=" * 40)
    
    try:
        from services.openai_service import test_openai_service
        return test_openai_service()
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ OpenAI service test failed: {e}")
        return False

def test_ai_configuration():
    """Test AI configuration system"""
    print("\n🔧 Testing AI Configuration")
    print("=" * 40)
    
    try:
        from services.ai_config import get_service_status, AIConfig, AIProvider
        
        # Test configuration
        config = AIConfig.from_env()
        print(f"✅ Configuration loaded")
        print(f"   Provider: {config.provider.value}")
        print(f"   OpenAI Model: {config.openai_model}")
        print(f"   OpenAI Key: {'✅ Set' if config.openai_api_key else '❌ Not set'}")
        
        # Test service status
        status = get_service_status()
        print(f"✅ Service status retrieved")
        
        for service_name, service_info in status.items():
            if isinstance(service_info, dict) and 'available' in service_info:
                available_icon = "✅" if service_info['available'] else "❌"
                configured_icon = "✅" if service_info['configured'] else "❌"
                print(f"   {service_name}: Configured: {configured_icon}, Available: {available_icon}")
        
        return True
        
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

def test_rag_pipeline():
    """Test RAG pipeline with OpenAI integration"""
    print("\n🔍 Testing RAG Pipeline")
    print("=" * 40)
    
    try:
        # Check if database exists
        db_path = Path(__file__).parent.parent / "data" / "clinical_canvas.db"
        if not db_path.exists():
            print("❌ Database not found. Run: python initialize_db.py && python populate_demo_data.py")
            return False
        
        from services.rag_openai import test_rag_openai_pipeline
        return test_rag_openai_pipeline()
        
    except Exception as e:
        print(f"❌ RAG pipeline test failed: {e}")
        return False

def test_clinical_functions():
    """Test specific clinical functions"""
    print("\n🏥 Testing Clinical Functions")
    print("=" * 40)
    
    try:
        from services import get_ai_service
        
        ai_service = get_ai_service()
        
        if not ai_service:
            print("❌ No AI service available")
            return False
        
        if not hasattr(ai_service, 'generate_patient_summary'):
            print("⚠️  AI service doesn't support advanced clinical functions (using Ollama)")
            return True
        
        # Test patient summary
        print("Testing patient summary generation...")
        sample_patient = {
            "name": "Test Patient",
            "age": 65,
            "gender": "Male"
        }
        
        sample_clinical = {
            "vitals": [
                {"name": "Blood Pressure", "value": "140/90", "unit": "mmHg", "date_recorded": "2024-01-15"},
                {"name": "Heart Rate", "value": "72", "unit": "bpm", "date_recorded": "2024-01-15"}
            ],
            "labs": [
                {"name": "Glucose", "value": "120", "unit": "mg/dL", "reference_range": "70-100", "date_recorded": "2024-01-15"}
            ]
        }
        
        summary_result = ai_service.generate_patient_summary(sample_patient, sample_clinical)
        
        if summary_result["success"]:
            print("✅ Patient summary generated")
            print(f"   Summary: {summary_result['summary'][:100]}...")
            print(f"   Confidence: {summary_result.get('confidence_score', 0):.2f}")
        else:
            print(f"❌ Patient summary failed: {summary_result['error']}")
            return False
        
        # Test clinical Q&A
        print("\nTesting clinical Q&A...")
        qa_context = {
            "patient": sample_patient,
            "labs": sample_clinical["labs"],
            "vitals": sample_clinical["vitals"]
        }
        
        qa_result = ai_service.answer_clinical_question(
            "What are the key findings from the recent test results?",
            qa_context
        )
        
        if qa_result["success"]:
            print("✅ Clinical Q&A working")
            print(f"   Answer: {qa_result['answer'][:100]}...")
            print(f"   Confidence: {qa_result.get('confidence_score', 0):.2f}")
        else:
            print(f"❌ Clinical Q&A failed: {qa_result['error']}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Clinical functions test failed: {e}")
        return False

def test_integration_compatibility():
    """Test compatibility with existing FastAPI integration"""
    print("\n🔗 Testing Integration Compatibility")
    print("=" * 40)
    
    try:
        # Test that we can import everything needed for integration
        from services import (
            get_rag_pipeline, 
            get_service_status, 
            get_ai_service,
            OpenAIService,
            RAGPipelineOpenAI
        )
        print("✅ All required modules imported successfully")
        
        # Test RAG pipeline initialization  
        db_path = Path(__file__).parent.parent / "data" / "clinical_canvas.db"
        if db_path.exists():
            rag = get_rag_pipeline(str(db_path))
            if rag:
                print("✅ RAG pipeline initialized successfully")
            else:
                print("❌ RAG pipeline initialization failed")
                return False
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 OpenAI Integration Test Suite")
    print("=" * 50)
    
    # Check prerequisites
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  OPENAI_API_KEY not set. Some tests may fail.")
        print("   Set with: export OPENAI_API_KEY='your-api-key-here'")
        print()
    
    # Run tests
    tests = [
        ("AI Configuration", test_ai_configuration),
        ("OpenAI Service", test_openai_service), 
        ("RAG Pipeline", test_rag_pipeline),
        ("Clinical Functions", test_clinical_functions),
        ("Integration Compatibility", test_integration_compatibility)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results[test_name] = False
    
    # Summary
    print("\n📊 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! OpenAI integration is ready.")
        print("\nNext steps:")
        print("   1. Update main.py to use the new services")
        print("   2. Set OPENAI_API_KEY environment variable")
        print("   3. Start the FastAPI server")
        print("   4. Test the clinical Q&A and SOAP generation endpoints")
    else:
        print("\n⚠️  Some tests failed. Please check the configuration and try again.")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)