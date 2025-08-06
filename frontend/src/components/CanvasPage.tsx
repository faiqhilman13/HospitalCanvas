import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import ClinicalCanvas from './ClinicalCanvas'
import PatientSelector from './PatientSelector'
import RoleSelector from './RoleSelector'
import { useCanvasStore } from '../stores/canvasStore'

const queryClient = new QueryClient()

function CanvasPage() {
  const navigate = useNavigate()
  const [selectedPatientId, setSelectedPatientId] = useState<string>('uncle-tan-001')
  const { currentRole, setCurrentRole } = useCanvasStore()

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Back to Home"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                AI-Powered Clinical Canvas
              </h1>
              <div className="text-sm text-gray-500">
                Interactive Patient Document Analysis
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <RoleSelector
                currentRole={currentRole}
                onRoleChange={setCurrentRole}
              />
              <PatientSelector
                selectedPatientId={selectedPatientId}
                onPatientSelect={setSelectedPatientId}
              />
            </div>
          </div>
        </header>

        {/* Main Canvas Area */}
        <main className="flex-1 relative">
          <ClinicalCanvas patientId={selectedPatientId} />
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default CanvasPage