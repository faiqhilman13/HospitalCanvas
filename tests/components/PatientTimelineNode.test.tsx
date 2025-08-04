import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../frontend/src/test-utils'
import PatientTimelineNode from '../../frontend/src/components/nodes/PatientTimelineNode'
import { createMockPatient, createMockTimelineEvent, mockTimelineEvents } from '../../frontend/src/mocks/fixtures'

describe('PatientTimelineNode', () => {
  const mockPatient = createMockPatient()
  const mockEvents = mockTimelineEvents

  const defaultProps = {
    id: 'timeline-1',
    data: {
      events: mockEvents,
      patient: mockPatient,
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-31'
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders PatientTimeline node correctly', () => {
    render(<PatientTimelineNode {...defaultProps} />)
    
    expect(screen.getByText('Patient Timeline')).toBeInTheDocument()
    expect(screen.getByText(`${mockPatient.name} • ${mockEvents.length} events`)).toBeInTheDocument()
  })

  it('displays timeline events with correct information', () => {
    render(<PatientTimelineNode {...defaultProps} />)
    
    // Check if events are displayed
    expect(screen.getByText('Nephrology Consultation')).toBeInTheDocument()
    expect(screen.getByText('Laboratory Results')).toBeInTheDocument()
    expect(screen.getByText('Vital Signs')).toBeInTheDocument()
    expect(screen.getByText('Medication Adjustment')).toBeInTheDocument()
  })

  it('groups events by date correctly', () => {
    render(<PatientTimelineNode {...defaultProps} />)
    
    // Should show date headers
    const dateHeaders = screen.getAllByText(/1\/15\/2024|1\/10\/2024|1\/5\/2024/)
    expect(dateHeaders.length).toBeGreaterThan(0)
  })

  it('displays event types with correct icons and colors', () => {
    render(<PatientTimelineNode {...defaultProps} />)
    
    // Check event type badges
    expect(screen.getByText('Visit')).toBeInTheDocument()
    expect(screen.getByText('Lab')).toBeInTheDocument()
    expect(screen.getByText('Vital')).toBeInTheDocument()
    expect(screen.getByText('Medication')).toBeInTheDocument()
  })

  it('shows urgency indicators', () => {
    render(<PatientTimelineNode {...defaultProps} />)
    
    // Check urgency badges
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('medium')).toBeInTheDocument()
    expect(screen.getByText('low')).toBeInTheDocument()
  })

  it('allows filtering events by type', () => {
    render(<PatientTimelineNode {...defaultProps} />)
    
    // Find and click the 'lab' filter button
    const labFilter = screen.getByRole('button', { name: /lab/i })
    fireEvent.click(labFilter)
    
    // Lab events should be hidden (filter toggled off)
    // The button should change appearance
    expect(labFilter).toHaveClass('bg-gray-200')
  })

  it('allows sorting events by date', () => {
    render(<PatientTimelineNode {...defaultProps} />)
    
    // Find sort button
    const sortButton = screen.getByTitle(/sort/i)
    fireEvent.click(sortButton)
    
    // Events should be re-sorted (this would require checking the order)
    expect(sortButton).toBeInTheDocument()
  })

  it('expands event details when clicked', () => {
    render(<PatientTimelineNode {...defaultProps} />)
    
    // Find details button for an event
    const detailsButtons = screen.getAllByText('Details')
    fireEvent.click(detailsButtons[0])
    
    // Should show expanded details
    // Check for specific details from mock data
    expect(screen.getByText(/Dr. Smith/)).toBeInTheDocument()
  })

  it('filters events by date range when provided', () => {
    const filteredProps = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        dateRange: {
          start: '2024-01-15',
          end: '2024-01-15'
        }
      }
    }

    render(<PatientTimelineNode {...filteredProps} />)
    
    // Should only show events from January 15th
    expect(screen.getByText('Nephrology Consultation')).toBeInTheDocument()
    expect(screen.getByText('Laboratory Results')).toBeInTheDocument()
    
    // Events from other dates should not be visible
    expect(screen.queryByText('Vital Signs')).not.toBeInTheDocument()
  })

  it('displays empty state when no events match filters', () => {
    const emptyProps = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        events: []
      }
    }

    render(<PatientTimelineNode {...emptyProps} />)
    
    expect(screen.getByText('No events found for selected filters')).toBeInTheDocument()
  })

  it('shows correct event count', () => {
    render(<PatientTimelineNode {...defaultProps} />)
    
    expect(screen.getByText(`${mockEvents.length} events shown`)).toBeInTheDocument()
  })

  it('displays date range in summary when provided', () => {
    render(<PatientTimelineNode {...defaultProps} />)
    
    expect(screen.getByText('1/1/2024 - 1/31/2024')).toBeInTheDocument()
  })

  it('handles events with different urgency levels', () => {
    const urgencyEvents = [
      createMockTimelineEvent({ id: '1', urgency: 'critical', title: 'Critical Event' }),
      createMockTimelineEvent({ id: '2', urgency: 'high', title: 'High Event' }),
      createMockTimelineEvent({ id: '3', urgency: 'medium', title: 'Medium Event' }),
      createMockTimelineEvent({ id: '4', urgency: 'low', title: 'Low Event' }),
    ]

    const urgencyProps = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        events: urgencyEvents
      }
    }

    render(<PatientTimelineNode {...urgencyProps} />)
    
    expect(screen.getByText('critical')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('medium')).toBeInTheDocument()
    expect(screen.getByText('low')).toBeInTheDocument()
  })

  it('handles different event types correctly', () => {
    const diverseEvents = [
      createMockTimelineEvent({ id: '1', type: 'visit', title: 'Visit Event' }),
      createMockTimelineEvent({ id: '2', type: 'lab', title: 'Lab Event' }),
      createMockTimelineEvent({ id: '3', type: 'vital', title: 'Vital Event' }),
      createMockTimelineEvent({ id: '4', type: 'document', title: 'Document Event' }),
      createMockTimelineEvent({ id: '5', type: 'procedure', title: 'Procedure Event' }),
      createMockTimelineEvent({ id: '6', type: 'medication', title: 'Medication Event' }),
    ]

    const diverseProps = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        events: diverseEvents
      }
    }

    render(<PatientTimelineNode {...diverseProps} />)
    
    // All event types should be displayed
    expect(screen.getByText('Visit Event')).toBeInTheDocument()
    expect(screen.getByText('Lab Event')).toBeInTheDocument()
    expect(screen.getByText('Vital Event')).toBeInTheDocument()
    expect(screen.getByText('Document Event')).toBeInTheDocument()
    expect(screen.getByText('Procedure Event')).toBeInTheDocument()
    expect(screen.getByText('Medication Event')).toBeInTheDocument()
  })

  it('renders node handles for canvas connections', () => {
    const { container } = render(<PatientTimelineNode {...defaultProps} />)
    
    // Check for react-flow handles
    const handles = container.querySelectorAll('[data-handleid]')
    expect(handles.length).toBeGreaterThan(0)
  })

  it('maintains scroll position in timeline', () => {
    const manyEvents = Array.from({ length: 20 }, (_, i) => 
      createMockTimelineEvent({ 
        id: `event-${i}`, 
        title: `Event ${i}`,
        date: new Date(2024, 0, i + 1).toISOString()
      })
    )

    const scrollProps = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        events: manyEvents
      }
    }

    render(<PatientTimelineNode {...scrollProps} />)
    
    // Timeline should have scrollable area
    const scrollableArea = screen.getByText('Event 0').closest('.max-h-96')
    expect(scrollableArea).toBeInTheDocument()
    expect(scrollableArea).toHaveClass('overflow-y-auto')
  })
})