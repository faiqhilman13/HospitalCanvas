import React, { useState, useMemo } from 'react'
import { Handle, Position } from '@xyflow/react'
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
      case 'visit': return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'lab': return 'bg-green-50 border-green-200 text-green-700'
      case 'vital': return 'bg-purple-50 border-purple-200 text-purple-700'
      case 'document': return 'bg-gray-50 border-gray-200 text-gray-700'
      case 'procedure': return 'bg-orange-50 border-orange-200 text-orange-700'
      case 'medication': return 'bg-pink-50 border-pink-200 text-pink-700'
      default: return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  // Get urgency colors
  const getUrgencyColors = (urgency?: string) => {
    switch (urgency) {
      case 'critical': return 'border-l-red-500 bg-red-50'
      case 'high': return 'border-l-orange-500 bg-orange-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-300 bg-white'
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
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-clinical-blue" />
          <div>
            <h3 className="font-semibold text-gray-900">Patient Timeline</h3>
            <p className="text-sm text-gray-600">{patient.name} • {filteredEvents.length} events</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Sort toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors text-xs"
            title={`Sort ${sortOrder === 'desc' ? 'oldest first' : 'newest first'}`}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
          
          {/* Filter dropdown */}
          <div className="relative">
            <button className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Event Type Filters */}
      <div className="mb-4 p-2 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-1">
          {eventTypeOptions.map(eventType => (
            <button
              key={eventType}
              onClick={() => toggleEventType(eventType)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedEventTypes.has(eventType)
                  ? getEventColors(eventType)
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
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
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No events found for selected filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
              <div key={dateKey} className="relative">
                {/* Date header */}
                <div className="sticky top-0 bg-white z-10 py-2 border-b border-gray-200">
                  <h4 className="font-medium text-gray-800 text-sm">{dateKey}</h4>
                </div>
                
                {/* Events for this date */}
                <div className="space-y-2 mt-2">
                  {dayEvents.map((event, index) => (
                    <div key={event.id} className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" 
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
                              <span className="text-xs text-gray-500">
                                {new Date(event.date).toLocaleTimeString()}
                              </span>
                              {event.urgency && (
                                <span className={`px-1.5 py-0.5 text-xs rounded ${
                                  event.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                                  event.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                                  event.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {event.urgency}
                                </span>
                              )}
                            </div>
                            
                            <h5 className="font-medium text-gray-900 text-sm mb-1">{event.title}</h5>
                            <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                            
                            {/* Expandable details */}
                            {event.details && (
                              <div>
                                <button
                                  onClick={() => toggleEventExpansion(event.id)}
                                  className="flex items-center space-x-1 text-xs text-clinical-blue hover:text-blue-700"
                                >
                                  {expandedEvents.has(event.id) ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  <span>Details</span>
                                </button>
                                
                                {expandedEvents.has(event.id) && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                    <pre className="whitespace-pre-wrap text-gray-700">
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
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
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