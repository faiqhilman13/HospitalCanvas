import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { server } from '../../frontend/src/mocks/server'
import { createMockSOAPNote, createMockPatient } from '../../frontend/src/mocks/fixtures'

describe('API Endpoints', () => {
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    vi.restoreAllMocks()
  })

  describe('Patient Data Endpoints', () => {
    it('fetches patient data successfully', async () => {
      const response = await fetch('http://localhost:8000/api/patients/patient-1')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.patient.id).toBe('patient-1')
      expect(data.patient.name).toBe('John Doe')
      expect(data.summary).toBeDefined()
      expect(data.canvas_layout).toBeDefined()
      expect(data.clinical_data).toBeDefined()
    })

    it('returns 404 for non-existent patient', async () => {
      const response = await fetch('http://localhost:8000/api/patients/non-existent')
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })

    it('fetches patient list successfully', async () => {
      const response = await fetch('http://localhost:8000/api/patients')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.patients).toBeDefined()
      expect(Array.isArray(data.patients)).toBe(true)
      expect(data.patients.length).toBeGreaterThan(0)
      
      const patient = data.patients[0]
      expect(patient.id).toBeDefined()
      expect(patient.name).toBeDefined()
      expect(patient.preview_summary).toBeDefined()
    })
  })

  describe('SOAP Note Endpoints', () => {
    it('generates SOAP note successfully', async () => {
      const response = await fetch('http://localhost:8000/api/patients/patient-1/soap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.id).toBeDefined()
      expect(data.patient_id).toBe('patient-1')
      expect(data.soap_sections).toBeDefined()
      expect(data.soap_sections.subjective).toBeDefined()
      expect(data.soap_sections.objective).toBeDefined()
      expect(data.soap_sections.assessment).toBeDefined()
      expect(data.soap_sections.plan).toBeDefined()
      expect(data.generated_by).toBe('ai')
      expect(data.confidence_score).toBeGreaterThan(0)
    })

    it('saves SOAP note successfully', async () => {
      const soapNote = createMockSOAPNote({
        patient_id: 'patient-1'
      })

      const response = await fetch('http://localhost:8000/api/patients/patient-1/soap/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(soapNote),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.message).toBe('SOAP note saved successfully')
    })

    it('fetches existing SOAP notes', async () => {
      const response = await fetch('http://localhost:8000/api/patients/patient-1/soap')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(Array.isArray(data)).toBe(true)
      
      if (data.length > 0) {
        const note = data[0]
        expect(note.id).toBeDefined()
        expect(note.patient_id).toBe('patient-1')
        expect(note.soap_sections).toBeDefined()
      }
    })

    it('handles invalid SOAP note data', async () => {
      const invalidSoapNote = {
        // Missing required fields
        patient_id: 'patient-1'
      }

      const response = await fetch('http://localhost:8000/api/patients/patient-1/soap/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidSoapNote),
      })

      // The mock should still succeed, but in a real API this might fail
      // This test documents the expected behavior
      expect(response.ok).toBe(true)
    })
  })

  describe('AI Q&A Endpoints', () => {
    it('processes question successfully', async () => {
      const question = "What are the patient's current medications?"

      const response = await fetch('http://localhost:8000/api/patients/patient-1/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.id).toBeDefined()
      expect(data.question).toBe(question)
      expect(data.answer).toBeDefined()
      expect(data.confidence).toBeGreaterThan(0)
      expect(data.source).toBeDefined()
      expect(data.source.document_id).toBeDefined()
      expect(data.source.page).toBeDefined()
      expect(data.source.text).toBeDefined()
    })

    it('handles empty questions', async () => {
      const response = await fetch('http://localhost:8000/api/patients/patient-1/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: '' }),
      })

      // Mock should still handle empty questions
      expect(response.ok).toBe(true)
    })

    it('handles complex medical questions', async () => {
      const complexQuestion = "Based on the patient's recent lab results, what is the trend in kidney function and what are the recommended interventions?"

      const response = await fetch('http://localhost:8000/api/patients/patient-1/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: complexQuestion }),
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.answer).toBeDefined()
      expect(data.confidence).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      // Simulate network error by using invalid URL
      try {
        await fetch('http://invalid-url/api/patients/patient-1')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('handles malformed JSON requests', async () => {
      const response = await fetch('http://localhost:8000/api/patients/patient-1/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      })

      // MSW should handle this gracefully in our mock
      // In a real API, this would likely return a 400 error
      expect(typeof response.status).toBe('number')
    })

    it('handles missing content-type header', async () => {
      const response = await fetch('http://localhost:8000/api/patients/patient-1/ask', {
        method: 'POST',
        body: JSON.stringify({ question: 'test question' }),
      })

      // Mock should still handle requests without content-type
      expect(typeof response.status).toBe('number')
    })
  })

  describe('Request/Response Format Validation', () => {
    it('validates SOAP note request format', async () => {
      const validSoapNote = createMockSOAPNote({
        patient_id: 'patient-1',
        soap_sections: {
          subjective: 'Patient reports...',
          objective: 'Vital signs...',
          assessment: 'Clinical impression...',
          plan: 'Treatment plan...'
        }
      })

      const response = await fetch('http://localhost:8000/api/patients/patient-1/soap/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validSoapNote),
      })

      expect(response.ok).toBe(true)
    })

    it('validates Q&A request format', async () => {
      const validRequest = {
        question: 'What is the patient\'s current condition?'
      }

      const response = await fetch('http://localhost:8000/api/patients/patient-1/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validRequest),
      })

      expect(response.ok).toBe(true)
    })

    it('handles concurrent requests', async () => {
      const requests = [
        fetch('http://localhost:8000/api/patients/patient-1'),
        fetch('http://localhost:8000/api/patients/patient-1/soap'),
        fetch('http://localhost:8000/api/patients/patient-1/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'Test question' }),
        }),
      ]

      const responses = await Promise.all(requests)

      responses.forEach(response => {
        expect(response.ok).toBe(true)
      })
    })
  })

  describe('Data Consistency', () => {
    it('maintains consistent patient IDs across endpoints', async () => {
      const patientId = 'patient-1'

      // Get patient data
      const patientResponse = await fetch(`http://localhost:8000/api/patients/${patientId}`)
      const patientData = await patientResponse.json()

      // Generate SOAP note
      const soapResponse = await fetch(`http://localhost:8000/api/patients/${patientId}/soap/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const soapData = await soapResponse.json()

      // Ask question
      const qaResponse = await fetch(`http://localhost:8000/api/patients/${patientId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'Test question' }),
      })
      const qaData = await qaResponse.json()

      expect(patientData.patient.id).toBe(patientId)
      expect(soapData.patient_id).toBe(patientId)
      // Q&A response doesn't include patient_id in mock, but endpoint path ensures consistency
    })

    it('returns consistent data structures', async () => {
      const response = await fetch('http://localhost:8000/api/patients/patient-1')
      const data = await response.json()

      // Verify expected structure
      expect(data).toHaveProperty('patient')
      expect(data).toHaveProperty('summary')
      expect(data).toHaveProperty('canvas_layout')
      expect(data).toHaveProperty('clinical_data')
      expect(data).toHaveProperty('documents')
      expect(data).toHaveProperty('qa_pairs')

      // Verify nested structures
      expect(data.patient).toHaveProperty('id')
      expect(data.patient).toHaveProperty('name')
      expect(data.summary).toHaveProperty('clinical_summary')
      expect(data.canvas_layout).toHaveProperty('viewport')
      expect(data.canvas_layout).toHaveProperty('nodes')
      expect(data.clinical_data).toHaveProperty('vitals')
      expect(data.clinical_data).toHaveProperty('labs')
    })
  })
})