import { useQuery } from '@tanstack/react-query'
import type { PatientData, UserRole } from '../types'
import { apiClient, handleApiError, createLoadingState, getCacheConfig, API_ENDPOINTS } from '../config/api'

// Mock patient data for development
const mockPatientData: Record<string, PatientData> = {
  'uncle-tan-001': {
    patient: {
      id: 'uncle-tan-001',
      name: 'Uncle Tan',
      age: 65,
      gender: 'male'
    },
    summary: {
      clinical_summary: 'Uncle Tan is a 65-year-old male with chronic kidney disease (CKD) stage 3b, diabetes mellitus type 2, and hypertension. Recent labs show declining renal function with eGFR of 48 mL/min/1.73m². Requires nephrology consultation and medication adjustments.',
      key_issues: [
        'Declining kidney function',
        'Diabetes management',
        'Hypertension control',
        'Medication review needed'
      ],
      urgency_level: 'high',
      confidence_score: 0.92
    },
    canvas_layout: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 'summary-1',
          type: 'patientSummary',
          position: { x: 50, y: 50 },
          size: { width: 350, height: 200 },
          data: {
            summary: {
              clinical_summary: 'Uncle Tan is a 65-year-old male with chronic kidney disease (CKD) stage 3b, diabetes mellitus type 2, and hypertension. Recent labs show declining renal function with eGFR of 48 mL/min/1.73m². Requires nephrology consultation and medication adjustments.',
              key_issues: [
                'Declining kidney function',
                'Diabetes management', 
                'Hypertension control',
                'Medication review needed'
              ],
              urgency_level: 'high',
              confidence_score: 0.92
            },
            patient: {
              id: 'uncle-tan-001',
              name: 'Uncle Tan',
              age: 65,
              gender: 'male'
            },
            visitHistory: [
              {
                date: '2024-07-15',
                type: 'urgent',
                summary: 'Nephrology consultation for declining kidney function',
                key_changes: ['eGFR dropped to 48', 'Creatinine elevated to 1.4']
              },
              {
                date: '2024-04-15',
                type: 'follow-up',
                summary: 'Quarterly diabetes and kidney function check',
                key_changes: ['eGFR declined from 62 to 55', 'HbA1c stable']
              },
              {
                date: '2024-01-15',
                type: 'routine',
                summary: 'Annual physical examination',
                key_changes: ['New ACE inhibitor started', 'Diet counseling provided']
              }
            ],
            criticalAlerts: [
              {
                id: 'alert-001',
                type: 'lab',
                message: 'eGFR critically low at 48 mL/min/1.73m² - urgent nephrology referral needed',
                severity: 'critical',
                date: '2024-07-15',
                resolved: false
              },
              {
                id: 'alert-002',
                type: 'vital',
                message: 'Blood pressure consistently elevated >140/90 mmHg',
                severity: 'warning',
                date: '2024-07-15',
                resolved: false
              }
            ],
            trendAnalysis: {
              improving: ['Blood sugar control'],
              declining: ['Kidney function', 'Blood pressure control'],
              stable: ['Medication adherence'],
              confidence: 0.88
            }
          }
        },
        {
          id: 'vitals-1',
          type: 'vitalsChart',
          position: { x: 450, y: 50 },
          size: { width: 400, height: 300 },
          data: {
            title: 'Kidney Function Trend',
            vitals: [
              {
                name: 'eGFR',
                values: [
                  { date: '2024-01-15', value: '62', unit: 'mL/min/1.73m²', reference_range: '>60' },
                  { date: '2024-04-15', value: '55', unit: 'mL/min/1.73m²', reference_range: '>60' },
                  { date: '2024-07-15', value: '48', unit: 'mL/min/1.73m²', reference_range: '>60', flag: 'low' }
                ]
              }
            ]
          }
        },
        {
          id: 'document-1',
          type: 'documentViewer',
          position: { x: 50, y: 300 },
          size: { width: 350, height: 400 },
          data: {
            document: {
              id: 'doc-001',
              filename: 'uncle_tan_referral.pdf',
              type: 'referral',
              url: '/demo-documents/uncle_tan_referral.pdf',
              pages: 15
            }
          }
        },
        {
          id: 'qa-1',
          type: 'aiQuestionBox',
          position: { x: 450, y: 400 },
          size: { width: 400, height: 300 },
          data: {
            qa_pairs: [
              {
                id: 'qa-001',
                question: "What's the trend in this patient's kidney function?",
                answer: "Uncle Tan's kidney function has been declining over the past year. His eGFR has dropped from 62 mL/min/1.73m² in January to 48 mL/min/1.73m² in July, indicating progression from CKD stage 3a to 3b.",
                confidence: 0.95,
                source: {
                  document_id: 'doc-001',
                  page: 12,
                  text: 'Laboratory Results: eGFR 48 mL/min/1.73m² (previous: 55 mL/min/1.73m² in April, 62 mL/min/1.73m² in January)'
                }
              }
            ]
          }
        },
        {
          id: 'soap-generator-1',
          type: 'SOAPGenerator',
          position: { x: 50, y: 750 },
          size: { width: 500, height: 400 },
          data: {
            patient: {
              id: 'uncle-tan-001',
              name: 'Uncle Tan',
              age: 65,
              gender: 'male'
            },
            clinical_data: {
              vitals: [
                {
                  name: 'Blood Pressure',
                  values: [
                    { date: '2024-07-15', value: '145/88', unit: 'mmHg', reference_range: '<140/90', flag: 'high' }
                  ]
                }
              ],
              labs: [
                {
                  category: 'Renal Function',
                  tests: [
                    {
                      name: 'eGFR',
                      value: '48',
                      unit: 'mL/min/1.73m²',
                      reference_range: '>60',
                      flag: 'low',
                      date: '2024-07-15'
                    }
                  ]
                }
              ]
            }
          }
        },
        {
          id: 'timeline-1',
          type: 'Timeline',
          position: { x: 600, y: 750 },
          size: { width: 450, height: 400 },
          data: {
            patient: {
              id: 'uncle-tan-001',
              name: 'Uncle Tan',
              age: 65,
              gender: 'male'
            },
            events: [
              {
                id: 'event-001',
                date: '2024-07-15T09:00:00Z',
                type: 'visit',
                title: 'Nephrology Consultation',
                description: 'Follow-up visit for chronic kidney disease management',
                urgency: 'high',
                details: 'Patient evaluated for CKD progression. eGFR declined to 48. Discussed treatment options and monitoring plan.'
              },
              {
                id: 'event-002',
                date: '2024-07-15T10:30:00Z',
                type: 'lab',
                title: 'Comprehensive Metabolic Panel',
                description: 'Blood work showing kidney function decline',
                urgency: 'high',
                details: 'Creatinine: 1.4 mg/dL (↑), eGFR: 48 mL/min/1.73m² (↓), BUN: 25 mg/dL'
              },
              {
                id: 'event-003',
                date: '2024-07-15T11:00:00Z',
                type: 'vital',
                title: 'Vital Signs Assessment',
                description: 'Blood pressure monitoring and weight check',
                urgency: 'medium',
                details: 'BP: 145/88 mmHg, Weight: 72 kg, HR: 78 bpm, Temp: 98.6°F'
              },
              {
                id: 'event-004',
                date: '2024-04-15T14:00:00Z',
                type: 'lab',
                title: 'Routine Lab Panel',
                description: 'Quarterly kidney function monitoring',
                urgency: 'medium',
                details: 'Creatinine: 1.2 mg/dL, eGFR: 55 mL/min/1.73m², showing gradual decline'
              },
              {
                id: 'event-005',
                date: '2024-01-15T09:30:00Z',
                type: 'visit',
                title: 'Primary Care Visit',
                description: 'Annual physical examination',
                urgency: 'low',
                details: 'General health assessment. Kidney function stable at that time.'
              }
            ],
            dateRange: {
              start: '2024-01-01',
              end: '2024-08-01'
            }
          }
        }
      ],
      connections: []
    },
    clinical_data: {
      vitals: [
        {
          name: 'Blood Pressure',
          values: [
            { date: '2024-07-15', value: '145/88', unit: 'mmHg', reference_range: '<140/90', flag: 'high' },
            { date: '2024-04-15', value: '142/85', unit: 'mmHg', reference_range: '<140/90', flag: 'high' },
            { date: '2024-01-15', value: '138/82', unit: 'mmHg', reference_range: '<140/90', flag: 'normal' }
          ]
        }
      ],
      labs: [
        {
          category: 'Renal Function',
          tests: [
            {
              name: 'eGFR',
              value: '48',
              unit: 'mL/min/1.73m²',
              reference_range: '>60',
              flag: 'low',
              date: '2024-07-15'
            },
            {
              name: 'Creatinine',
              value: '1.4',
              unit: 'mg/dL',
              reference_range: '0.7-1.3',
              flag: 'high',
              date: '2024-07-15'
            }
          ]
        }
      ]
    },
    documents: [
      {
        id: 'doc-001',
        filename: 'uncle_tan_referral.pdf',
        type: 'referral',
        url: '/demo-documents/uncle_tan_referral.pdf',
        pages: 15
      }
    ],
    qa_pairs: [
      {
        id: 'qa-001',
        question: "What's the trend in this patient's kidney function?",
        answer: "Uncle Tan's kidney function has been declining over the past year. His eGFR has dropped from 62 mL/min/1.73m² in January to 48 mL/min/1.73m² in July, indicating progression from CKD stage 3a to 3b.",
        confidence: 0.95,
        source: {
          document_id: 'doc-001',
          page: 12,
          text: 'Laboratory Results: eGFR 48 mL/min/1.73m² (previous: 55 mL/min/1.73m² in April, 62 mL/min/1.73m² in January)'
        }
      }
    ]
  }
}

async function fetchPatientData(patientId: string, role: UserRole = 'clinician'): Promise<PatientData> {
  // Try to fetch from real API first with role parameter
  const result = await apiClient.get<any>(API_ENDPOINTS.PATIENT_ROLE_DATA(patientId, role))
  
  if (result.success && result.data) {
    // Transform backend API response to frontend format
    const apiData = result.data
    const transformedData: PatientData = {
      patient: {
        id: apiData.id,
        name: apiData.name,
        age: apiData.age,
        gender: apiData.gender?.toLowerCase() || 'unknown'
      },
      summary: {
        clinical_summary: apiData.ai_summary || 'No AI summary available',
        key_issues: apiData.key_issues || [],
        urgency_level: determineUrgencyFromSummary(apiData.ai_summary || ''),
        confidence_score: apiData.confidence_score || 0.85
      },
      canvas_layout: {
        viewport: apiData.canvas_layout?.viewport || { x: 0, y: 0, zoom: 1 },
        nodes: apiData.canvas_layout?.nodes || [],
        connections: apiData.canvas_layout?.connections || []
      },
      clinical_data: {
        vitals: transformVitalsData(apiData.vitals_data || []),
        labs: transformLabData(apiData.lab_results || [])
      },
      documents: apiData.documents || [],
      qa_pairs: apiData.qa_pairs || []
    }
    
    return transformedData
  }
  
  // Log the error for debugging
  if (result.error) {
    console.warn('Failed to fetch patient data from API, falling back to mock data:', result.error.message)
  }
  
  // Check if fallback is enabled
  const config = apiClient.getConfig()
  if (config.enableMockFallback) {
    // Simulate network delay for mock data
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const data = mockPatientData[patientId]
    if (!data) {
      throw new Error(`Patient with ID ${patientId} not found`)
    }
    
    return data
  }
  
  // Throw error if no fallback is enabled
  throw new Error(result.error?.message || `Failed to fetch patient data for ${patientId}`)
}

function determineUrgencyFromSummary(summary: string): 'low' | 'medium' | 'high' {
  const urgent_keywords = ['urgent', 'critical', 'severe', 'acute', 'emergency']
  const medium_keywords = ['moderate', 'concerning', 'requires', 'follow-up']
  
  const lowerSummary = summary.toLowerCase()
  
  if (urgent_keywords.some(keyword => lowerSummary.includes(keyword))) {
    return 'high'
  }
  if (medium_keywords.some(keyword => lowerSummary.includes(keyword))) {
    return 'medium'
  }
  return 'low'
}

function transformVitalsData(vitalsData: any[]): any[] {
  const groupedVitals: Record<string, any[]> = {}
  
  vitalsData.forEach(vital => {
    if (!groupedVitals[vital.name]) {
      groupedVitals[vital.name] = []
    }
    groupedVitals[vital.name].push({
      date: vital.date_recorded,
      value: vital.value,
      unit: vital.unit,
      reference_range: vital.reference_range,
      flag: determineFlag(vital.value, vital.reference_range)
    })
  })
  
  return Object.entries(groupedVitals).map(([name, values]) => ({
    name: formatVitalName(name),
    values
  }))
}

function transformLabData(labData: any[]): any[] {
  const groupedLabs: Record<string, any[]> = {}
  
  labData.forEach(lab => {
    const category = getCategoryForLab(lab.name)
    if (!groupedLabs[category]) {
      groupedLabs[category] = []
    }
    groupedLabs[category].push({
      name: lab.name,
      value: lab.value,
      unit: lab.unit,
      reference_range: lab.reference_range,
      flag: determineFlag(lab.value, lab.reference_range),
      date: lab.date_recorded
    })
  })
  
  return Object.entries(groupedLabs).map(([category, tests]) => ({
    category,
    tests
  }))
}

function formatVitalName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getCategoryForLab(labName: string): string {
  const renalLabs = ['creatinine', 'bun', 'egfr', 'albumin']
  const electrolyteLabs = ['potassium', 'sodium', 'chloride', 'co2']
  const hematologyLabs = ['hemoglobin', 'hematocrit', 'wbc', 'platelets']
  const endocrineLabs = ['glucose', 'hba1c', 'tsh', 'parathyroid_hormone']
  
  const lowerName = labName.toLowerCase()
  
  if (renalLabs.some(lab => lowerName.includes(lab))) return 'Renal Function'
  if (electrolyteLabs.some(lab => lowerName.includes(lab))) return 'Electrolytes'
  if (hematologyLabs.some(lab => lowerName.includes(lab))) return 'Hematology'
  if (endocrineLabs.some(lab => lowerName.includes(lab))) return 'Endocrine'
  
  return 'Other'
}

function determineFlag(value: string, referenceRange: string): 'low' | 'high' | 'normal' {
  // This is a simplified flag determination - in real app would be more sophisticated
  if (!referenceRange || referenceRange === 'N/A') return 'normal'
  
  const numericValue = parseFloat(value)
  if (isNaN(numericValue)) return 'normal'
  
  // Simple range parsing (e.g., "0.7-1.3", ">60", "<140")
  if (referenceRange.includes('-')) {
    const [min, max] = referenceRange.split('-').map(v => parseFloat(v.trim()))
    if (numericValue < min) return 'low'
    if (numericValue > max) return 'high'
  } else if (referenceRange.startsWith('>')) {
    const threshold = parseFloat(referenceRange.substring(1))
    if (numericValue <= threshold) return 'low'
  } else if (referenceRange.startsWith('<')) {
    const threshold = parseFloat(referenceRange.substring(1))
    if (numericValue >= threshold) return 'high'
  }
  
  return 'normal'
}

export function usePatientData(patientId: string, role: UserRole = 'clinician') {
  const cacheConfig = getCacheConfig()
  
  return useQuery({
    queryKey: ['patient', patientId, role],
    queryFn: () => fetchPatientData(patientId, role),
    enabled: !!patientId,
    staleTime: cacheConfig.patientDataTTL,
    gcTime: cacheConfig.patientDataTTL * 2, // Double the stale time for garbage collection
    retry: (failureCount, error) => {
      // Don't retry if we have fallback data available
      const config = apiClient.getConfig()
      if (config.enableMockFallback && failureCount > 1) {
        return false
      }
      
      // Don't retry on 404 errors (patient not found)
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return false
      }
      
      // Standard retry logic for network errors
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}