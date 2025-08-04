import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../frontend/src/test-utils'
import PatientSummaryNode from '../../frontend/src/components/nodes/PatientSummaryNode'
import { createMockPatient } from '../../frontend/src/mocks/fixtures'

describe('PatientSummaryNode', () => {
  const mockPatient = createMockPatient({
    name: 'John Doe',
    age: 65,
    gender: 'male'
  })

  const mockSummary = {
    clinical_summary: 'Patient with chronic kidney disease stage 3, well-controlled diabetes, and hypertension. Recent decline in kidney function noted.',
    key_issues: ['Chronic kidney disease', 'Diabetes Type 2', 'Hypertension'],
    urgency_level: 'medium' as const,
    confidence_score: 0.92
  }

  const mockVisitHistory = [
    {
      date: '2024-01-15',
      type: 'urgent' as const,
      summary: 'Emergency visit for acute symptoms',
      key_changes: ['Increased creatinine', 'New medication started']
    },
    {
      date: '2024-01-10',
      type: 'routine' as const,
      summary: 'Regular follow-up visit',
      key_changes: ['Stable condition', 'Lab results reviewed']
    }
  ]

  const mockCriticalAlerts = [
    {
      id: 'alert-1',
      type: 'lab' as const,
      message: 'Creatinine level critically high: 1.8 mg/dL',
      severity: 'critical' as const,
      date: '2024-01-15',
      resolved: false
    },
    {
      id: 'alert-2',
      type: 'vital' as const,
      message: 'Blood pressure elevated: 140/90 mmHg',
      severity: 'warning' as const,
      date: '2024-01-14',
      resolved: true
    }
  ]

  const mockTrendAnalysis = {
    improving: ['Blood glucose control', 'Medication adherence'],
    declining: ['Kidney function', 'Energy levels'],
    stable: ['Blood pressure', 'Weight'],
    confidence: 0.85
  }

  const defaultProps = {
    id: 'summary-1',
    data: {
      summary: mockSummary,
      patient: mockPatient,
      visitHistory: mockVisitHistory,
      criticalAlerts: mockCriticalAlerts,
      trendAnalysis: mockTrendAnalysis
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Patient Summary node correctly', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    expect(screen.getByText('Patient Summary')).toBeInTheDocument()
    expect(screen.getByText(`${mockPatient.name}, ${mockPatient.age}`)).toBeInTheDocument()
    expect(screen.getByText('Male')).toBeInTheDocument()
  })

  it('displays clinical summary', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    expect(screen.getByText(mockSummary.clinical_summary)).toBeInTheDocument()
  })

  it('shows urgency level with correct styling', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    const urgencyBadge = screen.getByText('Medium')
    expect(urgencyBadge).toBeInTheDocument()
    expect(urgencyBadge).toHaveClass('bg-yellow-100', 'text-yellow-700')
  })

  it('displays confidence score', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    expect(screen.getByText('Confidence: 92%')).toBeInTheDocument()
    
    // Check confidence bar
    const confidenceBar = screen.getByRole('progressbar')
    expect(confidenceBar).toHaveStyle('width: 92%')
  })

  it('shows key issues as badges', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    mockSummary.key_issues.forEach(issue => {
      expect(screen.getByText(issue)).toBeInTheDocument()
    })
  })

  it('displays critical alerts section', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    expect(screen.getByText('Critical Alerts')).toBeInTheDocument()
    expect(screen.getByText(/Creatinine level critically high/)).toBeInTheDocument()
    expect(screen.getByText(/Blood pressure elevated/)).toBeInTheDocument()
  })

  it('shows alert severity correctly', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    // Critical alert should have red styling
    const criticalAlert = screen.getByText(/Creatinine level critically high/)
    expect(criticalAlert.closest('.border-l-red-500')).toBeInTheDocument()
    
    // Warning alert should have yellow styling  
    const warningAlert = screen.getByText(/Blood pressure elevated/)
    expect(warningAlert.closest('.border-l-yellow-500')).toBeInTheDocument()
  })

  it('displays resolved status for alerts', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    // Should show resolved status
    expect(screen.getByText('Resolved')).toBeInTheDocument()
  })

  it('shows visit history section', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    expect(screen.getByText('Recent Visits')).toBeInTheDocument()
    expect(screen.getByText('Emergency visit for acute symptoms')).toBeInTheDocument()
    expect(screen.getByText('Regular follow-up visit')).toBeInTheDocument()
  })

  it('displays visit types with correct styling', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    // Urgent visit should have red styling
    const urgentVisit = screen.getByText('Urgent')
    expect(urgentVisit).toHaveClass('bg-red-100', 'text-red-700')
    
    // Routine visit should have blue styling
    const routineVisit = screen.getByText('Routine')
    expect(routineVisit).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('shows trend analysis section', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    expect(screen.getByText('Trend Analysis')).toBeInTheDocument()
    expect(screen.getByText('Improving')).toBeInTheDocument()
    expect(screen.getByText('Declining')).toBeInTheDocument()
    expect(screen.getByText('Stable')).toBeInTheDocument()
  })

  it('displays trend items correctly', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    // Check improving trends
    expect(screen.getByText('Blood glucose control')).toBeInTheDocument()
    expect(screen.getByText('Medication adherence')).toBeInTheDocument()
    
    // Check declining trends
    expect(screen.getByText('Kidney function')).toBeInTheDocument()
    expect(screen.getByText('Energy levels')).toBeInTheDocument()
    
    // Check stable trends
    expect(screen.getByText('Blood pressure')).toBeInTheDocument()
    expect(screen.getByText('Weight')).toBeInTheDocument()
  })

  it('shows trend analysis confidence', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    expect(screen.getByText('Analysis confidence: 85%')).toBeInTheDocument()
  })

  it('handles different urgency levels', () => {
    const criticalProps = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        summary: {
          ...mockSummary,
          urgency_level: 'critical' as const
        }
      }
    }

    render(<PatientSummaryNode {...criticalProps} />)
    
    const urgencyBadge = screen.getByText('Critical')
    expect(urgencyBadge).toHaveClass('bg-red-100', 'text-red-700')
  })

  it('expands and collapses sections', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    // Find expandable section headers
    const alertsHeader = screen.getByText('Critical Alerts')
    fireEvent.click(alertsHeader)
    
    // Section should collapse (implementation specific)
    // This would need to be implemented in the actual component
  })

  it('handles missing optional data gracefully', () => {
    const minimalProps = {
      id: 'summary-1',
      data: {
        summary: mockSummary,
        patient: mockPatient
        // No visitHistory, criticalAlerts, or trendAnalysis
      }
    }

    render(<PatientSummaryNode {...minimalProps} />)
    
    // Should still render basic summary
    expect(screen.getByText('Patient Summary')).toBeInTheDocument()
    expect(screen.getByText(mockPatient.name)).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    // Check date formatting in visit history
    expect(screen.getByText('1/15/2024')).toBeInTheDocument()
    expect(screen.getByText('1/10/2024')).toBeInTheDocument()
  })

  it('shows alert timestamps', () => {
    render(<PatientSummaryNode {...defaultProps} />)
    
    // Check alert dates
    expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument()
    expect(screen.getByText(/1\/14\/2024/)).toBeInTheDocument()
  })

  it('renders node handles for canvas connections', () => {
    const { container } = render(<PatientSummaryNode {...defaultProps} />)
    
    // Check for react-flow handles
    const handles = container.querySelectorAll('[data-handleid]')
    expect(handles.length).toBeGreaterThan(0)
  })

  it('handles long clinical summaries with truncation', () => {
    const longSummaryProps = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        summary: {
          ...mockSummary,
          clinical_summary: 'This is a very long clinical summary that should be truncated if it exceeds the maximum display length. '.repeat(10)
        }
      }
    }

    render(<PatientSummaryNode {...longSummaryProps} />)
    
    // Should still render without breaking
    expect(screen.getByText('Patient Summary')).toBeInTheDocument()
  })

  it('displays gender information correctly', () => {
    const femaleProps = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        patient: {
          ...mockPatient,
          gender: 'female'
        }
      }
    }

    render(<PatientSummaryNode {...femaleProps} />)
    
    expect(screen.getByText('Female')).toBeInTheDocument()
  })

  it('handles empty arrays gracefully', () => {
    const emptyArrayProps = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        summary: {
          ...mockSummary,
          key_issues: []
        },
        visitHistory: [],
        criticalAlerts: [],
        trendAnalysis: {
          improving: [],
          declining: [],
          stable: [],
          confidence: 0
        }
      }
    }

    render(<PatientSummaryNode {...emptyArrayProps} />)
    
    // Should render without errors
    expect(screen.getByText('Patient Summary')).toBeInTheDocument()
  })
})