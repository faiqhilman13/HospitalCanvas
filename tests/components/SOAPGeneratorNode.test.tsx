import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../frontend/src/test-utils'
import SOAPGeneratorNode from '../../frontend/src/components/nodes/SOAPGeneratorNode'
import { createMockPatient, createMockSOAPNote } from '../../frontend/src/mocks/fixtures'

// Mock the useSOAPNotes hook
vi.mock('../../frontend/src/hooks/useSOAPNotes', () => ({
  createSOAPNoteHandlers: () => ({
    onGenerate: vi.fn(),
    onSave: vi.fn(),
    existingNotes: [],
    isGenerating: false,
    isSaving: false,
    generateError: null,
    saveError: null
  })
}))

describe('SOAPGeneratorNode', () => {
  const mockPatient = createMockPatient()
  const mockClinicalData = {
    vitals: [],
    labs: []
  }

  const defaultProps = {
    id: 'soap-generator-1',
    data: {
      patient: mockPatient,
      clinical_data: mockClinicalData
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders SOAPGenerator node correctly', () => {
    render(<SOAPGeneratorNode {...defaultProps} />)
    
    expect(screen.getByText('SOAP Note Generator')).toBeInTheDocument()
    expect(screen.getByText(mockPatient.name)).toBeInTheDocument()
    expect(screen.getByText('Generate')).toBeInTheDocument()
  })

  it('displays empty state when no SOAP note exists', () => {
    render(<SOAPGeneratorNode {...defaultProps} />)
    
    expect(screen.getByText('No SOAP note generated yet')).toBeInTheDocument()
    expect(screen.getByText(/Click "Generate" to create an AI-powered SOAP note/)).toBeInTheDocument()
  })

  it('calls onGenerate when Generate button is clicked', async () => {
    const mockOnGenerate = vi.fn().mockResolvedValue(createMockSOAPNote())
    
    // Re-mock the hook with our spy
    vi.doMock('../../frontend/src/hooks/useSOAPNotes', () => ({
      createSOAPNoteHandlers: () => ({
        onGenerate: mockOnGenerate,
        onSave: vi.fn(),
        existingNotes: [],
        isGenerating: false,
        isSaving: false,
        generateError: null,
        saveError: null
      })
    }))

    const { rerender } = render(<SOAPGeneratorNode {...defaultProps} />)
    
    const generateButton = screen.getByText('Generate')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith(mockPatient.id)
    })
  })

  it('displays loading state during generation', () => {
    // Mock loading state
    vi.doMock('../../frontend/src/hooks/useSOAPNotes', () => ({
      createSOAPNoteHandlers: () => ({
        onGenerate: vi.fn(),
        onSave: vi.fn(),
        existingNotes: [],
        isGenerating: true,
        isSaving: false,
        generateError: null,
        saveError: null
      })
    }))

    render(<SOAPGeneratorNode {...defaultProps} />)
    
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled()
  })

  it('displays SOAP note sections when note exists', () => {
    const mockNote = createMockSOAPNote()
    
    const propsWithNote = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        currentNote: mockNote
      }
    }

    render(<SOAPGeneratorNode {...propsWithNote} />)
    
    expect(screen.getByText('Subjective')).toBeInTheDocument()
    expect(screen.getByText('Objective')).toBeInTheDocument()
    expect(screen.getByText('Assessment')).toBeInTheDocument()
    expect(screen.getByText('Plan')).toBeInTheDocument()
    
    expect(screen.getByText(mockNote.soap_sections.subjective)).toBeInTheDocument()
    expect(screen.getByText(mockNote.soap_sections.objective)).toBeInTheDocument()
    expect(screen.getByText(mockNote.soap_sections.assessment)).toBeInTheDocument()
    expect(screen.getByText(mockNote.soap_sections.plan)).toBeInTheDocument()
  })

  it('shows confidence score and generation metadata', () => {
    const mockNote = createMockSOAPNote({
      confidence_score: 0.87,
      generated_by: 'ai'
    })

    const propsWithNote = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        currentNote: mockNote
      }
    }

    render(<SOAPGeneratorNode {...propsWithNote} />)
    
    expect(screen.getByText('Confidence: 87%')).toBeInTheDocument()
    expect(screen.getByText('AI Generated')).toBeInTheDocument()
  })

  it('allows editing SOAP sections', async () => {
    const mockNote = createMockSOAPNote()
    const mockOnSave = vi.fn()

    vi.doMock('../../frontend/src/hooks/useSOAPNotes', () => ({
      createSOAPNoteHandlers: () => ({
        onGenerate: vi.fn(),
        onSave: mockOnSave,
        existingNotes: [],
        isGenerating: false,
        isSaving: false,
        generateError: null,
        saveError: null
      })
    }))

    const propsWithNote = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        currentNote: mockNote
      }
    }

    render(<SOAPGeneratorNode {...propsWithNote} />)
    
    // Click edit button
    const editButton = screen.getByTitle('Edit SOAP Note')
    fireEvent.click(editButton)
    
    // Should show textareas for editing
    const subjectiveTextarea = screen.getByDisplayValue(mockNote.soap_sections.subjective)
    expect(subjectiveTextarea).toBeInTheDocument()
    expect(subjectiveTextarea.tagName).toBe('TEXTAREA')
    
    // Edit the subjective section
    fireEvent.change(subjectiveTextarea, { 
      target: { value: 'Updated subjective information' } 
    })
    
    expect(subjectiveTextarea).toHaveValue('Updated subjective information')
  })

  it('saves changes when save button is clicked', async () => {
    const mockNote = createMockSOAPNote()
    const mockOnSave = vi.fn()

    vi.doMock('../../frontend/src/hooks/useSOAPNotes', () => ({
      createSOAPNoteHandlers: () => ({
        onGenerate: vi.fn(),
        onSave: mockOnSave,
        existingNotes: [],
        isGenerating: false,
        isSaving: false,
        generateError: null,
        saveError: null
      })
    }))

    const propsWithNote = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        currentNote: mockNote
      }
    }

    render(<SOAPGeneratorNode {...propsWithNote} />)
    
    // Enter edit mode
    const editButton = screen.getByTitle('Edit SOAP Note')
    fireEvent.click(editButton)
    
    // Make changes
    const subjectiveTextarea = screen.getByDisplayValue(mockNote.soap_sections.subjective)
    fireEvent.change(subjectiveTextarea, { 
      target: { value: 'Updated subjective' } 
    })
    
    // Save changes
    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled()
    })
  })

  it('shows existing notes count', () => {
    const existingNotes = [
      createMockSOAPNote({ id: 'note-1' }),
      createMockSOAPNote({ id: 'note-2' }),
      createMockSOAPNote({ id: 'note-3' })
    ]

    vi.doMock('../../frontend/src/hooks/useSOAPNotes', () => ({
      createSOAPNoteHandlers: () => ({
        onGenerate: vi.fn(),
        onSave: vi.fn(),
        existingNotes,
        isGenerating: false,
        isSaving: false,
        generateError: null,
        saveError: null
      })
    }))

    render(<SOAPGeneratorNode {...defaultProps} />)
    
    expect(screen.getByText('Previous Notes: 3')).toBeInTheDocument()
  })

  it('handles generation errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockOnGenerate = vi.fn().mockRejectedValue(new Error('Generation failed'))

    vi.doMock('../../frontend/src/hooks/useSOAPNotes', () => ({
      createSOAPNoteHandlers: () => ({
        onGenerate: mockOnGenerate,
        onSave: vi.fn(),
        existingNotes: [],
        isGenerating: false,
        isSaving: false,
        generateError: null,
        saveError: null
      })
    }))

    render(<SOAPGeneratorNode {...defaultProps} />)
    
    const generateButton = screen.getByText('Generate')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to generate SOAP note:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('renders node handles for canvas connections', () => {
    const { container } = render(<SOAPGeneratorNode {...defaultProps} />)
    
    // Check for react-flow handles (they have specific data attributes)
    const handles = container.querySelectorAll('[data-handleid]')
    expect(handles.length).toBeGreaterThan(0)
  })
})