import React, { useState } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import { 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Bell,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import type { CanvasNodeProps, PatientSummaryNodeData } from '../../types'

const PatientSummaryNode: React.FC<CanvasNodeProps> = ({ data }) => {
  const { 
    summary, 
    patient, 
    visitHistory = [], 
    criticalAlerts = [], 
    trendAnalysis,
    // Handle database format
    patientName,
    age,
    urgencyLevel
  } = data as PatientSummaryNodeData & { patientName?: string; age?: number; urgencyLevel?: string }
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium':
        return <Clock className="w-4 h-4" />
      case 'low':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-700 border-red-200'
      case 'urgent': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'follow-up': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'routine': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTrendIcon = (items: string[]) => {
    if (!items.length) return <Minus className="w-3 h-3" />
    return items === trendAnalysis?.improving ? <TrendingUp className="w-3 h-3 text-green-600" /> :
           items === trendAnalysis?.declining ? <TrendingDown className="w-3 h-3 text-red-600" /> :
           <Minus className="w-3 h-3 text-gray-600" />
  }

  const unresolvedAlerts = criticalAlerts.filter(alert => !alert.resolved)

  return (
    <div className="canvas-node min-w-[400px] max-w-[500px]">
      <NodeResizer 
        minWidth={300} 
        minHeight={200} 
        maxWidth={600}
        maxHeight={800}
        shouldResize={() => true}
        handleStyle={{
          backgroundColor: '#3b82f6',
          width: '8px',
          height: '8px',
          border: '2px solid white',
        }}
        lineStyle={{
          borderColor: '#3b82f6',
          borderWidth: '2px',
        }}
      />
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-clinical-blue" />
          <div>
            <h3 className="font-semibold text-gray-900">{patient?.name || patientName || 'Unknown Patient'}</h3>
            <p className="text-sm text-gray-600">
              {patient?.age || age || 'Unknown'} years old • {patient?.gender || 'Unknown'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {unresolvedAlerts.length > 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <Bell className="w-3 h-3" />
              <span className="text-xs font-medium">{unresolvedAlerts.length}</span>
            </div>
          )}
          
          <div className={`px-2 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1 ${getUrgencyColor(summary?.urgency_level || urgencyLevel || 'medium')}`}>
            {getUrgencyIcon(summary?.urgency_level || urgencyLevel || 'medium')}
            <span className="capitalize">{summary?.urgency_level || urgencyLevel || 'medium'}</span>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {unresolvedAlerts.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('alerts')}
          >
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-red-600" />
              <h4 className="font-medium text-red-800">Critical Alerts ({unresolvedAlerts.length})</h4>
            </div>
            {expandedSection === 'alerts' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          
          {expandedSection === 'alerts' && (
            <div className="mt-2 space-y-2">
              {unresolvedAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="text-sm text-red-700 flex items-start space-x-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${alert.severity === 'critical' ? 'bg-red-600' : 'bg-orange-500'}`} />
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs text-red-600">{new Date(alert.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clinical Summary */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Clinical Summary</h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          {summary?.clinical_summary || data.summary || 'No clinical summary available'}
        </p>
      </div>

      {/* Key Issues with Trends */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Key Issues</h4>
        <div className="flex flex-wrap gap-1">
          {(summary?.key_issues || []).map((issue, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 flex items-center space-x-1"
            >
              <span>{issue}</span>
              {trendAnalysis && (
                <span className="ml-1">
                  {trendAnalysis.declining.includes(issue) && <TrendingDown className="w-3 h-3 text-red-500" />}
                  {trendAnalysis.improving.includes(issue) && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {trendAnalysis.stable.includes(issue) && <Minus className="w-3 h-3 text-gray-500" />}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Trend Analysis */}
      {trendAnalysis && (
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('trends')}
          >
            <h4 className="font-medium text-gray-800 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Trend Analysis</span>
            </h4>
            {expandedSection === 'trends' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          
          {expandedSection === 'trends' && (
            <div className="mt-2 space-y-2">
              {trendAnalysis.improving.length > 0 && (
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Improving</p>
                    <div className="flex flex-wrap gap-1">
                      {trendAnalysis.improving.map((item, idx) => (
                        <span key={idx} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {trendAnalysis.declining.length > 0 && (
                <div className="flex items-start space-x-2">
                  <TrendingDown className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Declining</p>
                    <div className="flex flex-wrap gap-1">
                      {trendAnalysis.declining.map((item, idx) => (
                        <span key={idx} className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {trendAnalysis.stable.length > 0 && (
                <div className="flex items-start space-x-2">
                  <Minus className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Stable</p>
                    <div className="flex flex-wrap gap-1">
                      {trendAnalysis.stable.map((item, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Visits */}
      {visitHistory.length > 0 && (
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('visits')}
          >
            <h4 className="font-medium text-gray-800 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Recent Visits ({visitHistory.length})</span>
            </h4>
            {expandedSection === 'visits' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          
          {expandedSection === 'visits' && (
            <div className="mt-2 space-y-2">
              {visitHistory.slice(0, 3).map((visit, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">
                      {new Date(visit.date).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getVisitTypeColor(visit.type)}`}>
                      {visit.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{visit.summary}</p>
                  {visit.key_changes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {visit.key_changes.map((change, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                          {change}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confidence Score */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>AI Confidence</span>
        <div className="flex items-center space-x-1">
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-clinical-blue rounded-full"
              style={{ width: `${(summary?.confidence_score || 0.85) * 100}%` }}
            />
          </div>
          <span>{Math.round((summary?.confidence_score || 0.85) * 100)}%</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default PatientSummaryNode