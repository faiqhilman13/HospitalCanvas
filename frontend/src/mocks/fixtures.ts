import type { 
  PatientData, 
  SOAPNote, 
  QAPair, 
  TimelineEvent,
  VitalSign,
  LabCategory 
} from '../types'

// Mock Patient Data
export const mockPatientData: Record<string, PatientData> = {
  'patient-1': {
    patient: {
      id: 'patient-1',
      name: 'John Doe',
      age: 65,
      gender: 'male'
    },
    summary: {
      clinical_summary: 'Patient with chronic kidney disease stage 3, well-controlled diabetes, and hypertension. Recent decline in kidney function noted.',
      key_issues: ['Chronic kidney disease', 'Diabetes Type 2', 'Hypertension'],
      urgency_level: 'medium',
      confidence_score: 0.92
    },
    canvas_layout: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 'summary-1',
          type: 'patientSummary',
          position: { x: 100, y: 100 },
          size: { width: 500, height: 400 },
          data: {}
        },
        {
          id: 'soap-1',
          type: 'SOAPGenerator',
          position: { x: 500, y: 100 },
          size: { width: 550, height: 450 },
          data: {}
        },
        {
          id: 'timeline-1',
          type: 'Timeline',
          position: { x: 100, y: 400 },
          size: { width: 550, height: 450 },
          data: {}
        }
      ],
      connections: []
    },
    clinical_data: {
      vitals: [
        {
          name: 'Blood Pressure',
          values: [
            { date: '2024-01-15', value: '140/90', unit: 'mmHg', flag: 'high' },
            { date: '2024-01-10', value: '135/85', unit: 'mmHg', flag: 'high' },
            { date: '2024-01-05', value: '130/80', unit: 'mmHg', flag: 'normal' }
          ]
        },
        {
          name: 'Heart Rate',
          values: [
            { date: '2024-01-15', value: '72', unit: 'bpm', flag: 'normal' },
            { date: '2024-01-10', value: '75', unit: 'bpm', flag: 'normal' },
            { date: '2024-01-05', value: '74', unit: 'bpm', flag: 'normal' }
          ]
        }
      ],
      labs: [
        {
          category: 'Kidney Function',
          tests: [
            {
              name: 'Creatinine',
              value: '1.8',
              unit: 'mg/dL',
              reference_range: '0.7-1.3',
              flag: 'high',
              date: '2024-01-15'
            },
            {
              name: 'eGFR',
              value: '45',
              unit: 'mL/min/1.73m²',
              reference_range: '>60',
              flag: 'low',
              date: '2024-01-15'
            }
          ]
        }
      ]
    },
    documents: [
      {
        id: 'doc-1',
        filename: 'recent_visit_notes.pdf',
        type: 'Clinical Notes',
        url: '/api/documents/doc-1',
        pages: 3
      }
    ],
    qa_pairs: []
  }
}

// Mock SOAP Notes
export const mockSOAPNotes: SOAPNote[] = [
  {
    id: 'soap-1',
    patient_id: 'patient-1',
    date: '2024-01-15T10:00:00Z',
    soap_sections: {
      subjective: 'Patient reports feeling more fatigued recently. Some swelling in legs noted.',
      objective: 'BP 140/90, HR 72, temp 98.6°F. Bilateral lower extremity edema present.',
      assessment: 'Chronic kidney disease stage 3 with progression. Fluid retention evident.',
      plan: 'Increase diuretic dose. Nephrology referral. Follow-up in 1 week.'
    },
    generated_by: 'ai',
    confidence_score: 0.89,
    last_modified: '2024-01-15T10:30:00Z'
  }
]

// Mock Q&A Pairs
export const mockQAPairs: QAPair[] = [
  {
    id: 'qa-1',
    question: 'What are the patient\'s current medications?',
    answer: 'The patient is currently on Lisinopril 10mg daily, Metformin 1000mg twice daily, and Furosemide 20mg daily.',
    confidence: 0.92,
    source: {
      document_id: 'doc-1',
      page: 2,
      text: 'Current medications include Lisinopril 10mg daily for hypertension...'
    }
  }
]

// Mock Timeline Events
export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'event-1',
    date: '2024-01-15T10:00:00Z',
    type: 'visit',
    title: 'Nephrology Consultation',
    description: 'Follow-up visit for chronic kidney disease management',
    urgency: 'medium',
    details: {
      provider: 'Dr. Smith',
      duration: '45 minutes',
      notes: 'Patient discussed treatment options and lifestyle modifications'
    }
  },
  {
    id: 'event-2',
    date: '2024-01-15T08:30:00Z',
    type: 'lab',
    title: 'Laboratory Results',
    description: 'Comprehensive metabolic panel and kidney function tests',
    urgency: 'high',
    details: {
      abnormal_values: ['Creatinine: 1.8 mg/dL (↑)', 'eGFR: 45 mL/min/1.73m² (↓)'],
      provider_notified: true
    }
  },
  {
    id: 'event-3',
    date: '2024-01-10T14:20:00Z',
    type: 'vital',
    title: 'Vital Signs',
    description: 'Routine vital signs measurement',
    urgency: 'low',
    details: {
      blood_pressure: '135/85 mmHg',
      heart_rate: '75 bpm',
      temperature: '98.4°F',
      weight: '180 lbs'
    }
  },
  {
    id: 'event-4',
    date: '2024-01-05T16:00:00Z',
    type: 'medication',
    title: 'Medication Adjustment',
    description: 'Increased Furosemide dosage',
    urgency: 'medium',
    details: {
      medication: 'Furosemide',
      old_dose: '20mg daily',
      new_dose: '40mg daily',
      reason: 'Fluid retention management'
    }
  }
]

// Test data generators
export const createMockPatient = (overrides: any = {}) => ({
  id: 'test-patient',
  name: 'Test Patient',
  age: 50,
  gender: 'male' as const,
  ...overrides
})

export const createMockSOAPNote = (overrides: any = {}): SOAPNote => ({
  id: 'test-soap-note',
  patient_id: 'test-patient',
  date: new Date().toISOString(),
  soap_sections: {
    subjective: 'Test subjective data',
    objective: 'Test objective data',
    assessment: 'Test assessment',
    plan: 'Test plan'
  },
  generated_by: 'ai',
  confidence_score: 0.85,
  last_modified: new Date().toISOString(),
  ...overrides
})

export const createMockTimelineEvent = (overrides: any = {}): TimelineEvent => ({
  id: 'test-event',
  date: new Date().toISOString(),
  type: 'visit',
  title: 'Test Event',
  description: 'Test event description',
  urgency: 'medium',
  ...overrides
})