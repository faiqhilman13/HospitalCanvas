import React, { useState } from 'react'
import { ChevronDown, User, Loader2 } from 'lucide-react'
import type { PatientSelectorProps } from '../types'
import { usePatients } from '../hooks/usePatients'

// Mock patient data for demo
const DEMO_PATIENTS = [
  {
    id: 'uncle-tan-001',
    name: 'Uncle Tan',
    preview_summary: '65-year-old with declining kidney function, chronic conditions'
  },
  {
    id: 'mrs-chen-002',
    name: 'Mrs. Chen',
    preview_summary: '58-year-old diabetes management, cardiovascular risk'
  },
  {
    id: 'mr-kumar-003',
    name: 'Mr. Kumar',
    preview_summary: '72-year-old hypertension, recent cardiac assessment'
  }
]

function getPreviewSummary(patient: { id: string; name: string; age: number; gender: string }): string {
  // Generate preview summaries based on patient data
  const summaryMap: Record<string, string> = {
    'uncle-tan-001': `${patient.age}-year-old with chronic kidney disease requiring urgent follow-up`,
    'mrs-chen-002': `${patient.age}-year-old with diabetes management and blood pressure concerns`,
    'mr-kumar-003': `${patient.age}-year-old post-MI patient requiring cardiac rehabilitation`
  }
  
  return summaryMap[patient.id] || `${patient.age}-year-old ${patient.gender.toLowerCase()} patient`
}

const PatientSelector: React.FC<PatientSelectorProps> = ({
  selectedPatientId,
  onPatientSelect
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { data: patients = [], isLoading, error } = usePatients()
  
  // Create patient summaries for display
  const patientsWithSummary = patients.map(patient => ({
    ...patient,
    preview_summary: getPreviewSummary(patient)
  }))
  
  const selectedPatient = patientsWithSummary.find(p => p.id === selectedPatientId)

  const handlePatientSelect = (patientId: string) => {
    onPatientSelect(patientId)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <div className="text-left">
            <div className="font-medium text-gray-900">
              {selectedPatient?.name || 'Select Patient'}
            </div>
            {selectedPatient && (
              <div className="text-xs text-gray-500 max-w-xs truncate">
                {selectedPatient.preview_summary}
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-sm font-semibold text-gray-700 px-2 py-1 mb-1">
                Demo Patients
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="ml-2 text-sm text-gray-500">Loading patients...</span>
                </div>
              ) : error ? (
                <div className="p-4 text-sm text-red-600">
                  Failed to load patients. Using demo data.
                </div>
              ) : null}
              
              {patientsWithSummary.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient.id)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    patient.id === selectedPatientId ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <User className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {patient.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {patient.preview_summary}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PatientSelector