import React, { useState, useMemo } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import { 
  Calendar, 
  Clock, 
  FileText, 
  Activity, 
  TestTube, 
  Pill, 
  Stethoscope,
  ChevronDown,
  ChevronRight,
  Filter
} from 'lucide-react'
import type { CanvasNodeProps, PatientTimelineNodeData, TimelineEvent } from '../../types'

const PatientTimelineNode: React.FC<CanvasNodeProps> = ({ data }) => {
  const { events, patient, dateRange } = data as PatientTimelineNodeData
  
  // Add null safety check for patient data  
  if (!patient || !events) {
    return (
      <div className="canvas-node min-w-[450px] max-w-[600px]">
        <NodeResizer
          minWidth={350}
          minHeight={250}
          maxWidth={650}
          maxHeight={550}
          shouldResize={() => true}
          handleStyle={{
            backgroundColor: '#84cc16',
            width: '8px',
            height: '8px',
            border: '2px solid white'
          }}
          lineStyle={{
            borderColor: '#84cc16',
            borderWidth: '2px'
          }}
        />
        <Handle type="target" position={Position.Top} />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-white/70" />
            <div>
              <h3 className="font-semibold text-white">Patient Timeline</h3>
              <p className="text-sm text-white/70">Patient data not available</p>
            </div>
          </div>
        </div>

        <div className="text-center py-8 text-white/70">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-white/50" />
          <p className="text-sm mb-2">Timeline data not available for this role</p>
          <p className="text-xs text-white/50">
            Patient timeline requires clinical context
          </p>
        </div>

        <Handle type="source" position={Position.Bottom} />
      </div>
    )
  }
  
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [selectedEventTypes, setSelectedEventTypes] = useState<Set<string>>(new Set(['visit', 'lab', 'vital', 'document', 'procedure', 'medication']))
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  // Get icon for event type
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'visit': return <Stethoscope className="w-4 h-4" />
      case 'lab': return <TestTube className="w-4 h-4" />
      case 'vital': return <Activity className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'procedure': return <Stethoscope className="w-4 h-4" />
      case 'medication': return <Pill className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  // Get color scheme for event type
  const getEventColors = (type: string) => {
    switch (type) {
      case 'visit': return 'bg-blue-500/20 border-blue-400/30 text-blue-300'
      case 'lab': return 'bg-green-500/20 border-green-400/30 text-green-300'
      case 'vital': return 'bg-purple-500/20 border-purple-400/30 text-purple-300'
      case 'document': return 'bg-white/10 border-white/20 text-white/70'
      case 'procedure': return 'bg-orange-500/20 border-orange-400/30 text-orange-300'
      case 'medication': return 'bg-pink-500/20 border-pink-400/30 text-pink-300'
      default: return 'bg-white/10 border-white/20 text-white/70'
    }
  }

  // Get urgency colors
  const getUrgencyColors = (urgency?: string) => {
    switch (urgency) {
      case 'critical': return 'border-l-red-500 bg-red-500/10'
      case 'high': return 'border-l-orange-500 bg-orange-500/10'
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/10'
      case 'low': return 'border-l-green-500 bg-green-500/10'
      default: return 'border-l-white/30 bg-white/5'
    }
  }

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => selectedEventTypes.has(event.type))
    
    // Apply date range filter if provided
    if (dateRange) {
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= startDate && eventDate <= endDate
      })
    }
    
    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    })
    
    return filtered
  }, [events, selectedEventTypes, dateRange, sortOrder])

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {}
    filteredEvents.forEach(event => {
      const dateKey = new Date(event.date).toLocaleDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(event)
    })
    return groups
  }, [filteredEvents])

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  const toggleEventType = (eventType: string) => {
    const newSelected = new Set(selectedEventTypes)
    if (newSelected.has(eventType)) {
      newSelected.delete(eventType)
    } else {
      newSelected.add(eventType)
    }
    setSelectedEventTypes(newSelected)
  }

  const eventTypeOptions = ['visit', 'lab', 'vital', 'document', 'procedure', 'medication']

  return (
    <div className="canvas-node min-w-[450px] max-w-[600px]">
      <NodeResizer
        minWidth={350}
        minHeight={250}
        maxWidth={650}
        maxHeight={550}
        shouldResize={() => true}
        handleStyle={{
          backgroundColor: '#84cc16',
          width: '8px',
          height: '8px',
          border: '2px solid white'
        }}
        lineStyle={{
          borderColor: '#84cc16',
          borderWidth: '2px'
        }}
      />
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-white" />
          <div>
            <h3 className="font-semibold text-white">Patient Timeline</h3>
            <p className="text-sm text-white/70">{patient.name} • {filteredEvents.length} events</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Sort toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors text-xs"
            title={`Sort ${sortOrder === 'desc' ? 'oldest first' : 'newest first'}`}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
          
          {/* Filter dropdown */}
          <div className="relative">
            <button className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Event Type Filters */}
      <div className="mb-4 p-2 bg-white/5 rounded-lg">
        <div className="flex flex-wrap gap-1">
          {eventTypeOptions.map(eventType => (
            <button
              key={eventType}
              onClick={() => toggleEventType(eventType)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedEventTypes.has(eventType)
                  ? getEventColors(eventType)
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <div className="flex items-center space-x-1">
                {getEventIcon(eventType)}
                <span className="capitalize">{eventType}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-white/50" />
            <p className="text-sm">No events found for selected filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
              <div key={dateKey} className="relative">
                {/* Date header */}
                <div className="sticky top-0 bg-gray-900/95 z-10 py-2 border-b border-white/10">
                  <h4 className="font-medium text-white text-sm">{dateKey}</h4>
                </div>
                
                {/* Events for this date */}
                <div className="space-y-2 mt-2">
                  {dayEvents.map((event, index) => (
                    <div key={event.id} className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-white/20" 
                           style={{ display: index === dayEvents.length - 1 ? 'none' : 'block' }} />
                      
                      {/* Event card */}
                      <div className={`relative pl-10 pr-4 py-2 border-l-4 rounded-r-lg ${getUrgencyColors(event.urgency)}`}>
                        {/* Timeline dot */}
                        <div className={`absolute left-2 top-3 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                          getEventColors(event.type).split(' ')[0]
                        }`} />
                        
                        {/* Event content */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs ${getEventColors(event.type)}`}>
                                {getEventIcon(event.type)}
                                <span className="capitalize">{event.type}</span>
                              </div>
                              <span className="text-xs text-white/50">
                                {new Date(event.date).toLocaleTimeString()}
                              </span>
                              {event.urgency && (
                                <span className={`px-1.5 py-0.5 text-xs rounded ${
                                  event.urgency === 'critical' ? 'bg-red-500/20 text-red-300' :
                                  event.urgency === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                  event.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-green-500/20 text-green-300'
                                }`}>
                                  {event.urgency}
                                </span>
                              )}
                            </div>
                            
                            <h5 className="font-medium text-white text-sm mb-1">{event.title}</h5>
                            <p className="text-sm text-white/80 mb-2">{event.description}</p>
                            
                            {/* Expandable details */}
                            {event.details && (
                              <div>
                                <button
                                  onClick={() => toggleEventExpansion(event.id)}
                                  className="flex items-center space-x-1 text-xs text-blue-300 hover:text-blue-200"
                                >
                                  {expandedEvents.has(event.id) ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  <span>Details</span>
                                </button>
                                
                                {expandedEvents.has(event.id) && (
                                  <div className="mt-2 p-2 bg-white/5 rounded text-xs">
                                    <pre className="whitespace-pre-wrap text-white/80">
                                      {typeof event.details === 'string' 
                                        ? event.details 
                                        : JSON.stringify(event.details, null, 2)
                                      }
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex justify-between text-xs text-white/50">
          <span>{filteredEvents.length} events shown</span>
          {dateRange && (
            <span>
              {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default PatientTimelineNode