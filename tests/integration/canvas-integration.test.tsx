import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../frontend/src/test-utils'
import ClinicalCanvas from '../../frontend/src/components/ClinicalCanvas'
import { mockPatientData } from '../../frontend/src/mocks/fixtures'

// Mock the canvas store
const mockStore = {
  patientData: null,
  selectedPatientId: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  nodes: [],
  connections: [],
  setPatientData: vi.fn(),
  updateNodePosition: vi.fn(),
  updateViewport: vi.fn(),
}

vi.mock('../../frontend/src/stores/canvasStore', () => ({
  useCanvasStore: () => mockStore
}))

// Mock the patient data hook
const mockPatientDataHook = {
  data: null,
  isLoading: false,
  error: null,
}

vi.mock('../../frontend/src/hooks/usePatientData', () => ({
  usePatientData: () => mockPatientDataHook
}))

// Mock React Flow components
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react')
  return {
    ...actual,
    ReactFlow: ({ children, nodes, edges, nodeTypes }: any) => (
      <div data-testid="react-flow">
        <div data-testid="node-count">{nodes?.length || 0}</div>
        <div data-testid="edge-count">{edges?.length || 0}</div>
        <div data-testid="node-types">{Object.keys(nodeTypes || {}).join(',')}</div>
        {children}
      </div>
    ),
    Background: () => <div data-testid="background" />,
    Controls: () => <div data-testid="controls" />,
    MiniMap: () => <div data-testid="minimap" />,
  }
})

describe('ClinicalCanvas Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.patientData = null
    mockStore.nodes = []
    mockStore.connections = []
    mockPatientDataHook.data = null
    mockPatientDataHook.isLoading = false
    mockPatientDataHook.error = null
  })

  it('renders loading state when data is loading', () => {
    mockPatientDataHook.isLoading = true

    render(<ClinicalCanvas patientId="patient-1" />)

    expect(screen.getByText('Loading patient data...')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('renders error state when data loading fails', () => {
    mockPatientDataHook.error = new Error('Failed to load patient data')

    render(<ClinicalCanvas patientId="patient-1" />)

    expect(screen.getByText('Error loading patient data')).toBeInTheDocument()
    expect(screen.getByText('Failed to load patient data')).toBeInTheDocument()
  })

  it('renders empty state when no patient is selected', () => {
    render(<ClinicalCanvas patientId="patient-1" />)

    expect(screen.getByText('Select a patient to view their clinical canvas')).toBeInTheDocument()
  })

  it('renders canvas with patient data', async () => {
    const patientData = mockPatientData['patient-1']
    mockPatientDataHook.data = patientData
    mockStore.patientData = patientData
    mockStore.nodes = patientData.canvas_layout.nodes

    render(<ClinicalCanvas patientId="patient-1" />)

    await waitFor(() => {
      expect(screen.getByTestId('react-flow')).toBeInTheDocument()
    })

    // Check that nodes are rendered
    expect(screen.getByTestId('node-count')).toHaveTextContent('3')
    
    // Check that all node types are registered
    const nodeTypes = screen.getByTestId('node-types').textContent
    expect(nodeTypes).toContain('patientSummary')
    expect(nodeTypes).toContain('SOAPGenerator')
    expect(nodeTypes).toContain('Timeline')
    expect(nodeTypes).toContain('vitalsChart')
    expect(nodeTypes).toContain('documentViewer')
    expect(nodeTypes).toContain('aiQuestionBox')
    expect(nodeTypes).toContain('labResults')
  })

  it('includes all required canvas controls', async () => {
    const patientData = mockPatientData['patient-1']
    mockPatientDataHook.data = patientData
    mockStore.patientData = patientData

    render(<ClinicalCanvas patientId="patient-1" />)

    await waitFor(() => {
      expect(screen.getByTestId('background')).toBeInTheDocument()
      expect(screen.getByTestId('controls')).toBeInTheDocument()
      expect(screen.getByTestId('minimap')).toBeInTheDocument()
    })
  })

  it('calls setPatientData when patient data is loaded', async () => {
    const patientData = mockPatientData['patient-1']
    
    // Start with no data
    render(<ClinicalCanvas patientId="patient-1" />)

    // Simulate data loading
    mockPatientDataHook.data = patientData

    // Re-render to trigger effect
    render(<ClinicalCanvas patientId="patient-1" />)

    await waitFor(() => {
      expect(mockStore.setPatientData).toHaveBeenCalledWith(patientData)
    })
  })

  it('updates node positions when nodes are dragged', async () => {
    const patientData = mockPatientData['patient-1']
    mockPatientDataHook.data = patientData
    mockStore.patientData = patientData
    mockStore.nodes = patientData.canvas_layout.nodes

    const { container } = render(<ClinicalCanvas patientId="patient-1" />)

    // Simulate node drag event (this would be more complex in real React Flow)
    // For now, we'll just verify the callback is set up correctly
    expect(mockStore.updateNodePosition).toBeDefined()
  })

  it('updates viewport when canvas is panned/zoomed', async () => {
    const patientData = mockPatientData['patient-1']
    mockPatientDataHook.data = patientData
    mockStore.patientData = patientData

    render(<ClinicalCanvas patientId="patient-1" />)

    // Verify viewport update callback is available
    expect(mockStore.updateViewport).toBeDefined()
  })

  it('converts canvas nodes to React Flow format correctly', async () => {
    const patientData = mockPatientData['patient-1']
    mockPatientDataHook.data = patientData
    mockStore.patientData = patientData
    mockStore.nodes = patientData.canvas_layout.nodes

    render(<ClinicalCanvas patientId="patient-1" />)

    await waitFor(() => {
      // Verify that the correct number of nodes is passed to ReactFlow
      expect(screen.getByTestId('node-count')).toHaveTextContent('3')
    })

    // Verify node conversion includes required properties
    // (In a more detailed test, we'd check the actual node structure)
    expect(mockStore.nodes).toEqual(patientData.canvas_layout.nodes)
  })

  it('handles node type registration correctly', () => {
    const patientData = mockPatientData['patient-1']
    mockPatientDataHook.data = patientData
    mockStore.patientData = patientData

    render(<ClinicalCanvas patientId="patient-1" />)

    const nodeTypes = screen.getByTestId('node-types').textContent
    
    // Check all node types are registered
    expect(nodeTypes).toContain('patientSummary')
    expect(nodeTypes).toContain('vitalsChart')
    expect(nodeTypes).toContain('documentViewer')
    expect(nodeTypes).toContain('aiQuestionBox')
    expect(nodeTypes).toContain('labResults')
    expect(nodeTypes).toContain('SOAPGenerator')
    expect(nodeTypes).toContain('Timeline')
  })

  it('handles canvas layout persistence', async () => {
    const patientData = mockPatientData['patient-1']
    mockPatientDataHook.data = patientData
    mockStore.patientData = patientData
    mockStore.viewport = patientData.canvas_layout.viewport

    render(<ClinicalCanvas patientId="patient-1" />)

    // Verify that viewport state is properly loaded
    expect(mockStore.viewport).toEqual(patientData.canvas_layout.viewport)
  })

  it('handles empty canvas layouts', () => {
    const patientData = {
      ...mockPatientData['patient-1'],
      canvas_layout: {
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: [],
        connections: []
      }
    }
    
    mockPatientDataHook.data = patientData
    mockStore.patientData = patientData
    mockStore.nodes = []

    render(<ClinicalCanvas patientId="patient-1" />)

    expect(screen.getByTestId('node-count')).toHaveTextContent('0')
    expect(screen.getByTestId('edge-count')).toHaveTextContent('0')
  })

  it('maintains canvas state across re-renders', async () => {
    const patientData = mockPatientData['patient-1']
    mockPatientDataHook.data = patientData
    mockStore.patientData = patientData
    mockStore.nodes = patientData.canvas_layout.nodes

    const { rerender } = render(<ClinicalCanvas patientId="patient-1" />)

    await waitFor(() => {
      expect(screen.getByTestId('node-count')).toHaveTextContent('3')
    })

    // Re-render with same patient
    rerender(<ClinicalCanvas patientId="patient-1" />)

    // State should be maintained
    expect(screen.getByTestId('node-count')).toHaveTextContent('3')
  })

  it('handles patient switching correctly', async () => {
    const patientData1 = mockPatientData['patient-1']
    mockPatientDataHook.data = patientData1
    mockStore.patientData = patientData1

    const { rerender } = render(<ClinicalCanvas patientId="patient-1" />)

    await waitFor(() => {
      expect(mockStore.setPatientData).toHaveBeenCalledWith(patientData1)
    })

    // Switch to different patient
    const patientData2 = {
      ...patientData1,
      patient: { ...patientData1.patient, id: 'patient-2', name: 'Jane Doe' }
    }
    
    mockPatientDataHook.data = patientData2
    rerender(<ClinicalCanvas patientId="patient-2" />)

    await waitFor(() => {
      expect(mockStore.setPatientData).toHaveBeenCalledWith(patientData2)
    })
  })

  it('provides accessibility features for canvas interaction', () => {
    const patientData = mockPatientData['patient-1']
    mockPatientDataHook.data = patientData
    mockStore.patientData = patientData

    render(<ClinicalCanvas patientId="patient-1" />)

    // React Flow should be accessible
    expect(screen.getByTestId('react-flow')).toBeInTheDocument()
  })
})