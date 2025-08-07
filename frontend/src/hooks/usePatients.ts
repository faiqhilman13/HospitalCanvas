import { useQuery } from '@tanstack/react-query'
import { apiClient, handleApiError, createLoadingState, getCacheConfig, API_ENDPOINTS } from '../config/api'

interface Patient {
  id: string
  name: string
  age: number
  gender: string
}

// Mock data fallback
const mockPatients: Patient[] = [
  { id: 'uncle-tan-001', name: 'Uncle Tan', age: 68, gender: 'Male' },
  { id: 'mrs-chen-002', name: 'Mrs. Chen', age: 54, gender: 'Female' },
  { id: 'mr-kumar-003', name: 'Mr. Kumar', age: 61, gender: 'Male' }
]

async function fetchPatients(): Promise<Patient[]> {
  const result = await apiClient.get<Patient[]>(API_ENDPOINTS.PATIENTS)
  
  if (result.success && result.data) {
    return result.data
  }
  
  // Log the error for debugging
  if (result.error) {
    console.warn('Failed to fetch patients from API, falling back to mock data:', result.error.message)
  }
  
  // Return mock data if API fails and fallback is enabled
  const config = apiClient.getConfig()
  if (config.enableMockFallback) {
    return mockPatients
  }
  
  // Throw error if no fallback is enabled
  throw new Error(result.error?.message || 'Failed to fetch patients')
}

export function usePatients() {
  const cacheConfig = getCacheConfig()
  
  return useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
    staleTime: cacheConfig.patientsListTTL,
    gcTime: cacheConfig.patientsListTTL * 2, // Double the stale time for garbage collection
    retry: (failureCount, error) => {
      // Don't retry if we have fallback data available
      const config = apiClient.getConfig()
      if (config.enableMockFallback && failureCount > 1) {
        return false
      }
      
      // Standard retry logic for network errors
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}