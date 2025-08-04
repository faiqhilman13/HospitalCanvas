import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { User, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import type { CanvasNodeProps, PatientSummaryNodeData } from '../../types'

const PatientSummaryNode: React.FC<CanvasNodeProps> = ({ data }) => {
  const { summary, patient } = data as PatientSummaryNodeData

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

  return (
    <div className="canvas-node min-w-[350px]">
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-clinical-blue" />
          <div>
            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
            <p className="text-sm text-gray-600">
              {patient.age} years old • {patient.gender}
            </p>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1 ${getUrgencyColor(summary.urgency_level)}`}>
          {getUrgencyIcon(summary.urgency_level)}
          <span className="capitalize">{summary.urgency_level}</span>
        </div>
      </div>

      {/* Clinical Summary */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Clinical Summary</h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          {summary.clinical_summary}
        </p>
      </div>

      {/* Key Issues */}
      <div className="mb-3">
        <h4 className="font-medium text-gray-800 mb-2">Key Issues</h4>
        <div className="flex flex-wrap gap-1">
          {summary.key_issues.map((issue, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
            >
              {issue}
            </span>
          ))}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>AI Confidence</span>
        <div className="flex items-center space-x-1">
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-clinical-blue rounded-full"
              style={{ width: `${summary.confidence_score * 100}%` }}
            />
          </div>
          <span>{Math.round(summary.confidence_score * 100)}%</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default PatientSummaryNode