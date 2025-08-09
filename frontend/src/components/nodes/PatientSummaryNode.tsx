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
  RefreshCw,
  Activity,
  Heart
} from 'lucide-react'
import type { CanvasNodeProps, PatientSummaryNodeData } from '../../types'
import HealthScoreIndicator from '../HealthScoreIndicator'

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

  // Calculate health score based on patient data
  const calculateHealthScore = () => {
    let score = 75 // Base score
    
    // Adjust based on urgency level
    switch (summary?.urgency_level || urgencyLevel) {
      case 'critical': score = 25; break;
      case 'high': score = 45; break;
      case 'medium': score = 65; break;
      case 'low': score = 85; break;
    }
    
    // Adjust for alerts
    score -= unresolvedAlerts.length * 5
    
    // Adjust for trends
    if (trendAnalysis) {
      score += trendAnalysis.improving.length * 5
      score -= trendAnalysis.declining.length * 10
    }
    
    return Math.max(0, Math.min(100, score))
  }

  const healthScore = calculateHealthScore()
  const urgency = summary?.urgency_level || urgencyLevel || 'medium'

  return (
    <div className={`canvas-node flex flex-col h-full w-full animate-fade-in hover-lift ${
      urgency === 'critical' ? 'critical' : urgency === 'high' ? 'warning' : ''
    }`}>
      <NodeResizer 
        minWidth={300} 
        minHeight={250} 
        shouldResize={() => true}
        handleStyle={{
          backgroundColor: '#3b82f6',
          width: '10px',
          height: '10px',
          border: '2px solid white',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
        }}
        lineStyle={{
          borderColor: '#3b82f6',
          borderWidth: '2px',
          borderStyle: 'dashed'
        }}
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{
          backgroundColor: '#10b981',
          border: '2px solid white',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}
      />
      
      {/* Enhanced Header with Health Score */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            {unresolvedAlerts.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {unresolvedAlerts.length}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white text-gradient">
              {patient?.name || patientName || 'Unknown Patient'}
            </h3>
            <p className="text-sm text-white/80">
              {patient?.age || age || 'Unknown'} years old • {patient?.gender || 'Unknown'}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs text-white/70">
                Last visit: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Health Score Indicator */}
        <div className="flex flex-col items-center space-y-2">
          <HealthScoreIndicator
            score={healthScore}
            label="Health Score"
            size="medium"
            critical={urgency === 'critical'}
            warning={urgency === 'high'}
            showAnimation={true}
          />
        </div>
      </div>

      {/* Enhanced Critical Alerts */}
      {unresolvedAlerts.length > 0 && (
        <div className="mb-4 p-4 glass-panel border border-red-500/30 bg-red-500/10 animate-scale-in">
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => toggleSection('alerts')}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-red-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <h4 className="font-semibold text-white">
                Critical Alerts ({unresolvedAlerts.length})
              </h4>
            </div>
            <div className="transform transition-transform group-hover:scale-110">
              {expandedSection === 'alerts' ? 
                <ChevronDown className="w-5 h-5 text-white/70" /> : 
                <ChevronRight className="w-5 h-5 text-white/70" />
              }
            </div>
          </div>
          
          {expandedSection === 'alerts' && (
            <div className="mt-3 space-y-3 animate-fade-in">
              {unresolvedAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="glass-panel p-3 border border-red-400/20">
                  <div className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-1 animate-pulse ${
                      alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-400'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{alert.message}</p>
                      <p className="text-xs text-white/60 mt-1">
                        {new Date(alert.date).toLocaleDateString()} • {alert.severity?.toUpperCase()}
                      </p>
                    </div>
                    <Activity className="w-4 h-4 text-red-400 animate-bounce" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Clinical Summary */}
      <div className="mb-4 glass-panel p-4 animate-fade-in">
        <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span>Clinical Summary</span>
        </h4>
        <p className="text-sm text-white/90 leading-relaxed">
          {summary?.clinical_summary || data.summary || 'No clinical summary available'}
        </p>
      </div>

      {/* Enhanced Key Issues with Trends */}
      <div className="mb-4">
        <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Key Issues</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {(summary?.key_issues || []).map((issue, index) => (
            <div
              key={index}
              className="group glass-panel px-3 py-2 hover-lift cursor-pointer transform transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white font-medium">{issue}</span>
                {trendAnalysis && (
                  <div className="flex items-center">
                    {trendAnalysis.declining.includes(issue) && (
                      <TrendingDown className="w-4 h-4 text-red-400 animate-pulse" />
                    )}
                    {trendAnalysis.improving.includes(issue) && (
                      <TrendingUp className="w-4 h-4 text-green-400 animate-bounce" />
                    )}
                    {trendAnalysis.stable.includes(issue) && (
                      <Minus className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Analysis */}
      {trendAnalysis && (
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => toggleSection('trends')}
          >
            <h4 className="font-semibold text-white flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span>Trend Analysis</span>
            </h4>
            <div className="transform transition-transform group-hover:scale-110">
              {expandedSection === 'trends' ? <ChevronDown className="w-5 h-5 text-white/70" /> : <ChevronRight className="w-5 h-5 text-white/70" />}
            </div>
          </div>
          
          {expandedSection === 'trends' && (
            <div className="mt-3 space-y-3 animate-fade-in">
              {trendAnalysis.improving.length > 0 && (
                <div className="glass-panel p-3 border border-green-400/20">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 animate-bounce" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-2">Improving</p>
                      <div className="flex flex-wrap gap-1">
                        {trendAnalysis.improving.map((item, idx) => (
                          <span key={idx} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {trendAnalysis.declining.length > 0 && (
                <div className="glass-panel p-3 border border-red-400/20">
                  <div className="flex items-start space-x-3">
                    <TrendingDown className="w-4 h-4 text-red-400 mt-0.5 animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-2">Declining</p>
                      <div className="flex flex-wrap gap-1">
                        {trendAnalysis.declining.map((item, idx) => (
                          <span key={idx} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full border border-red-500/30">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {trendAnalysis.stable.length > 0 && (
                <div className="glass-panel p-3 border border-gray-400/20">
                  <div className="flex items-start space-x-3">
                    <Minus className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-2">Stable</p>
                      <div className="flex flex-wrap gap-1">
                        {trendAnalysis.stable.map((item, idx) => (
                          <span key={idx} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full border border-white/20">
                            {item}
                          </span>
                        ))}
                      </div>
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
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => toggleSection('visits')}
          >
            <h4 className="font-semibold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Recent Visits ({visitHistory.length})</span>
            </h4>
            <div className="transform transition-transform group-hover:scale-110">
              {expandedSection === 'visits' ? <ChevronDown className="w-5 h-5 text-white/70" /> : <ChevronRight className="w-5 h-5 text-white/70" />}
            </div>
          </div>
          
          {expandedSection === 'visits' && (
            <div className="mt-3 space-y-3 animate-fade-in">
              {visitHistory.slice(0, 3).map((visit, index) => (
                <div key={index} className="glass-panel p-3 border border-white/10 hover-lift">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60">
                      {new Date(visit.date).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      visit.type === 'emergency' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      visit.type === 'urgent' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                      visit.type === 'follow-up' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      visit.type === 'routine' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      'bg-white/10 text-white/70 border border-white/20'
                    }`}>
                      {visit.type}
                    </span>
                  </div>
                  <p className="text-sm text-white/90 mb-2">{visit.summary}</p>
                  {visit.key_changes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {visit.key_changes.map((change, idx) => (
                        <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
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

      {/* Enhanced Confidence Score */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-white/80">AI Confidence</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(summary?.confidence_score || 0.85) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-white">
              {Math.round((summary?.confidence_score || 0.85) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{
          backgroundColor: '#ef4444',
          border: '2px solid white',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
        }}
      />
    </div>
  )
}

export default PatientSummaryNode