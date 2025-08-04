import { http, HttpResponse } from 'msw'
import type { SOAPNote, QAPair, PatientData } from '../types'
import { mockPatientData, mockSOAPNotes, mockQAPairs } from './fixtures'

const API_BASE_URL = 'http://localhost:8000/api'

export const handlers = [
  // Get patient data
  http.get(`${API_BASE_URL}/patients/:patientId`, ({ params }) => {
    const { patientId } = params
    const patient = mockPatientData[patientId as string]
    
    if (!patient) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(patient)
  }),

  // Generate SOAP note
  http.post(`${API_BASE_URL}/patients/:patientId/soap/generate`, ({ params }) => {
    const { patientId } = params
    const mockNote: SOAPNote = {
      id: `soap-${Date.now()}`,
      patient_id: patientId as string,
      date: new Date().toISOString(),
      soap_sections: {
        subjective: "Patient reports feeling better today. Less fatigue and improved appetite.",
        objective: "Vital signs stable. Temperature 98.6°F, BP 120/80, HR 72.",
        assessment: "Patient showing improvement in overall condition. Lab values trending positive.",
        plan: "Continue current medications. Follow-up in 2 weeks. Monitor symptoms closely."
      },
      generated_by: 'ai',
      confidence_score: 0.87,
      last_modified: new Date().toISOString()
    }
    
    return HttpResponse.json(mockNote)
  }),

  // Save SOAP note
  http.post(`${API_BASE_URL}/patients/:patientId/soap/save`, async ({ request }) => {
    const soapNote = await request.json() as SOAPNote
    
    return HttpResponse.json({
      success: true,
      message: 'SOAP note saved successfully',
      id: soapNote.id
    })
  }),

  // Get SOAP notes
  http.get(`${API_BASE_URL}/patients/:patientId/soap`, ({ params }) => {
    const { patientId } = params
    const notes = mockSOAPNotes.filter(note => note.patient_id === patientId)
    
    return HttpResponse.json(notes)
  }),

  // Ask question (AI Q&A)
  http.post(`${API_BASE_URL}/patients/:patientId/ask`, async ({ request, params }) => {
    const { question } = await request.json() as { question: string }
    const { patientId } = params
    
    const mockAnswer: QAPair = {
      id: `qa-${Date.now()}`,
      question,
      answer: "Based on the patient's clinical data, this appears to be a routine follow-up visit. The patient's vitals are stable and within normal ranges.",
      confidence: 0.85,
      source: {
        document_id: 'doc-1',
        page: 1,
        text: 'Patient presents for routine follow-up...'
      }
    }
    
    return HttpResponse.json(mockAnswer)
  }),

  // Get patient list
  http.get(`${API_BASE_URL}/patients`, () => {
    const patients = Object.values(mockPatientData).map(p => ({
      id: p.patient.id,
      name: p.patient.name,
      preview_summary: p.summary.clinical_summary.substring(0, 100) + '...'
    }))
    
    return HttpResponse.json({ patients })
  }),
]