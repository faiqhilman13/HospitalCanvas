import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SOAPNote } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// API functions
async function generateSOAPNote(patientId: string): Promise<SOAPNote> {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/soap/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to generate SOAP note: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function saveSOAPNote(patientId: string, soapNote: SOAPNote): Promise<{success: boolean; message: string}> {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/soap/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(soapNote),
  })

  if (!response.ok) {
    throw new Error(`Failed to save SOAP note: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function fetchSOAPNotes(patientId: string): Promise<SOAPNote[]> {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/soap`)

  if (!response.ok) {
    throw new Error(`Failed to fetch SOAP notes: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Hooks
export function useGenerateSOAPNote(patientId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => generateSOAPNote(patientId),
    onSuccess: () => {
      // Invalidate and refetch SOAP notes after successful generation
      queryClient.invalidateQueries({ queryKey: ['soap-notes', patientId] })
    },
  })
}

export function useSaveSOAPNote(patientId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (soapNote: SOAPNote) => saveSOAPNote(patientId, soapNote),
    onSuccess: () => {
      // Invalidate and refetch SOAP notes after successful save
      queryClient.invalidateQueries({ queryKey: ['soap-notes', patientId] })
    },
  })
}

export function useSOAPNotes(patientId: string) {
  return useQuery({
    queryKey: ['soap-notes', patientId],
    queryFn: () => fetchSOAPNotes(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Helper function to create SOAP note handlers for the node component
export function createSOAPNoteHandlers(patientId: string) {
  const generateMutation = useGenerateSOAPNote(patientId)
  const saveMutation = useSaveSOAPNote(patientId)
  const { data: existingNotes = [] } = useSOAPNotes(patientId)

  const handleGenerate = async (pid: string): Promise<SOAPNote> => {
    const result = await generateMutation.mutateAsync()
    return result
  }

  const handleSave = async (soapNote: SOAPNote): Promise<void> => {
    await saveMutation.mutateAsync(soapNote)
  }

  return {
    onGenerate: handleGenerate,
    onSave: handleSave,
    existingNotes,
    isGenerating: generateMutation.isPending,
    isSaving: saveMutation.isPending,
    generateError: generateMutation.error,
    saveError: saveMutation.error,
  }
}