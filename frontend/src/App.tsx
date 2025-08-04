import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ClinicalCanvas from './components/ClinicalCanvas'
import PatientSelector from './components/PatientSelector'
import './App.css'

const queryClient = new QueryClient()

function App() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('uncle-tan-001')

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                AI-Powered Clinical Canvas
              </h1>
              <div className="text-sm text-gray-500">
                Interactive Patient Document Analysis
              </div>
            </div>
            <PatientSelector
              selectedPatientId={selectedPatientId}
              onPatientSelect={setSelectedPatientId}
            />
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

export default App
