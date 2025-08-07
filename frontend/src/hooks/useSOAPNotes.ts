import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SOAPNote } from '../types'
import { apiClient, handleApiError, getCacheConfig, API_ENDPOINTS } from '../config/api'

// API functions
async function generateSOAPNote(patientId: string): Promise<SOAPNote> {
  const result = await apiClient.post<SOAPNote>(API_ENDPOINTS.SOAP_GENERATE(patientId))
  
  if (result.success && result.data) {
    return result.data
  }
  
  throw new Error(result.error?.message || 'Failed to generate SOAP note')
}

async function saveSOAPNote(patientId: string, soapNote: SOAPNote): Promise<{success: boolean; message: string}> {
  const result = await apiClient.post<{success: boolean; message: string}>(
    API_ENDPOINTS.SOAP_SAVE(patientId), 
    soapNote
  )
  
  if (result.success && result.data) {
    return result.data
  }
  
  throw new Error(result.error?.message || 'Failed to save SOAP note')
}

async function fetchSOAPNotes(patientId: string): Promise<SOAPNote[]> {
  const result = await apiClient.get<SOAPNote[]>(API_ENDPOINTS.SOAP_NOTES(patientId))
  
  if (result.success && result.data) {
    return result.data
  }
  
  // Return empty array if no SOAP notes found (not an error condition)
  if (result.error?.status === 404) {
    return []
  }
  
  throw new Error(result.error?.message || 'Failed to fetch SOAP notes')
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
  const cacheConfig = getCacheConfig()
  
  return useQuery({
    queryKey: ['soap-notes', patientId],
    queryFn: () => fetchSOAPNotes(patientId),
    enabled: !!patientId,
    staleTime: cacheConfig.soapNotesTTL,
    gcTime: cacheConfig.soapNotesTTL * 2, // Double the stale time for garbage collection
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (no SOAP notes found - this is valid)
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return false
      }
      
      // Standard retry logic for other errors
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
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