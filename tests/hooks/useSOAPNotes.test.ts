import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { 
  useGenerateSOAPNote, 
  useSaveSOAPNote, 
  useSOAPNotes, 
  createSOAPNoteHandlers 
} from '../../frontend/src/hooks/useSOAPNotes'
import { createMockSOAPNote } from '../../frontend/src/mocks/fixtures'

// Mock fetch
global.fetch = vi.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useSOAPNotes hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(fetch as any).mockClear()
  })

  describe('useGenerateSOAPNote', () => {
    it('generates SOAP note successfully', async () => {
      const mockSOAPNote = createMockSOAPNote()
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSOAPNote,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useGenerateSOAPNote('patient-1'), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockSOAPNote)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/patients/patient-1/soap/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    })

    it('handles generation errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useGenerateSOAPNote('patient-1'), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('Failed to generate SOAP note')
    })

    it('shows loading state during generation', async () => {
      ;(fetch as any).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => createMockSOAPNote(),
        }), 100))
      )

      const wrapper = createWrapper()
      const { result } = renderHook(() => useGenerateSOAPNote('patient-1'), { wrapper })

      result.current.mutate()

      expect(result.current.isPending).toBe(true)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.isPending).toBe(false)
    })
  })

  describe('useSaveSOAPNote', () => {
    it('saves SOAP note successfully', async () => {
      const mockResponse = { success: true, message: 'SOAP note saved successfully' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useSaveSOAPNote('patient-1'), { wrapper })

      const soapNote = createMockSOAPNote()
      result.current.mutate(soapNote)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/patients/patient-1/soap/save',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(soapNote),
        }
      )
    })

    it('handles save errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useSaveSOAPNote('patient-1'), { wrapper })

      const soapNote = createMockSOAPNote()
      result.current.mutate(soapNote)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('Failed to save SOAP note')
    })
  })

  describe('useSOAPNotes', () => {
    it('fetches SOAP notes successfully', async () => {
      const mockNotes = [createMockSOAPNote(), createMockSOAPNote({ id: 'soap-2' })]
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotes,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useSOAPNotes('patient-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockNotes)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/patients/patient-1/soap'
      )
    })

    it('handles fetch errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useSOAPNotes('patient-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('Failed to fetch SOAP notes')
    })

    it('does not fetch when patientId is empty', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useSOAPNotes(''), { wrapper })

      expect(result.current.isFetching).toBe(false)
      expect(fetch).not.toHaveBeenCalled()
    })

    it('uses correct cache configuration', async () => {
      const mockNotes = [createMockSOAPNote()]
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotes,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useSOAPNotes('patient-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // The query should be cached and not refetch immediately
      const { result: result2 } = renderHook(() => useSOAPNotes('patient-1'), { wrapper })
      
      expect(result2.current.data).toEqual(mockNotes)
    })
  })

  describe('createSOAPNoteHandlers', () => {
    it('creates handlers with correct functionality', async () => {
      const generateMock = createMockSOAPNote()
      const existingNotes = [createMockSOAPNote({ id: 'existing-1' })]

      // Mock successful responses
      ;(fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => existingNotes,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => generateMock,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, message: 'Saved' }),
        })

      const wrapper = createWrapper()
      const { result } = renderHook(() => createSOAPNoteHandlers('patient-1'), { wrapper })

      // Wait for existing notes to load
      await waitFor(() => {
        expect(result.current.existingNotes).toEqual(existingNotes)
      })

      // Test generate handler
      const generatedNote = await result.current.onGenerate('patient-1')
      expect(generatedNote).toEqual(generateMock)

      // Test save handler
      await result.current.onSave(generateMock)
      
      expect(fetch).toHaveBeenCalledTimes(3) // fetch existing notes, generate, save
    })

    it('provides loading states', async () => {
      ;(fetch as any).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => [],
        }), 100))
      )

      const wrapper = createWrapper()
      const { result } = renderHook(() => createSOAPNoteHandlers('patient-1'), { wrapper })

      expect(result.current.isGenerating).toBe(false)
      expect(result.current.isSaving).toBe(false)

      // Start generation
      const generatePromise = result.current.onGenerate('patient-1')
      
      // Should show loading state
      await waitFor(() => {
        expect(result.current.isGenerating).toBe(true)
      })

      await generatePromise

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false)
      })
    })

    it('provides error states', async () => {
      ;(fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error',
        })

      const wrapper = createWrapper()
      const { result } = renderHook(() => createSOAPNoteHandlers('patient-1'), { wrapper })

      try {
        await result.current.onGenerate('patient-1')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }

      await waitFor(() => {
        expect(result.current.generateError).toBeInstanceOf(Error)
      })
    })

    it('handles async operations correctly', async () => {
      const mockNote = createMockSOAPNote()
      ;(fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNote,
        })

      const wrapper = createWrapper()
      const { result } = renderHook(() => createSOAPNoteHandlers('patient-1'), { wrapper })

      const generatedNote = await result.current.onGenerate('patient-1')
      
      expect(generatedNote).toEqual(mockNote)
      expect(typeof result.current.onGenerate).toBe('function')
      expect(typeof result.current.onSave).toBe('function')
    })
  })
})