import { useQuery } from '@tanstack/react-query'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

interface Patient {
  id: string
  name: string
  age: number
  gender: string
}

async function fetchPatients(): Promise<Patient[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const patients = await response.json()
    return patients
    
  } catch (error) {
    console.warn('Failed to fetch patients from API, falling back to mock data:', error)
    
    // Fallback mock data
    return [
      { id: 'uncle-tan-001', name: 'Uncle Tan', age: 68, gender: 'Male' },
      { id: 'mrs-chen-002', name: 'Mrs. Chen', age: 54, gender: 'Female' },
      { id: 'mr-kumar-003', name: 'Mr. Kumar', age: 61, gender: 'Male' }
    ]
  }
}

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}