import { useState, useEffect } from 'react'
import { NodeResizer } from '@xyflow/react'
import type { CanvasNodeProps } from '../../types'

interface SystemAdminNodeData {
  system_metrics: {
    active_users: number
    total_patients: number
    documents_processed: number
    uptime_percentage: number
  }
  recent_activity: Array<{
    timestamp: string
    user: string
    action: string
    resource: string
  }>
}

export default function SystemAdminNode({ id, data }: CanvasNodeProps) {
  const [adminData, setAdminData] = useState<SystemAdminNodeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'metrics' | 'activity'>('metrics')

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        // Simulate admin data for now
        const mockData: SystemAdminNodeData = {
          system_metrics: {
            active_users: 24,
            total_patients: 45,
            documents_processed: 127,
            uptime_percentage: 99.8
          },
          recent_activity: [
            {
              timestamp: '2025-08-04T10:30:00Z',
              user: 'Dr. Aisha',
              action: 'Generated SOAP note',
              resource: 'patient/uncle-tan-001'
            },
            {
              timestamp: '2025-08-04T10:25:00Z',
              user: 'Siti (Analyst)',
              action: 'Viewed analytics dashboard',
              resource: 'analytics/population'
            },
            {
              timestamp: '2025-08-04T10:20:00Z',
              user: 'Dr. Aisha',
              action: 'Uploaded document',
              resource: 'document/lab-results-001.pdf'
            },
            {
              timestamp: '2025-08-04T10:15:00Z',
              user: 'System',
              action: 'Processed OCR',
              resource: 'document/medical-history-002.pdf'
            },
            {
              timestamp: '2025-08-04T10:10:00Z',
              user: 'Dr. Aisha',
              action: 'Updated patient timeline',
              resource: 'patient/mrs-chen-002'
            }
          ]
        }
        
        setAdminData(mockData)
      } catch (error) {
        console.error('Failed to fetch admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'active_users': return '👥'
      case 'total_patients': return '🏥'
      case 'documents_processed': return '📄'
      case 'uptime_percentage': return '⚡'
      default: return '📊'
    }
  }

  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case 'uptime_percentage':
        return value >= 99 ? 'text-green-600' : value >= 95 ? 'text-yellow-600' : 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('Generated')) return '📝'
    if (action.includes('Viewed')) return '👁️'
    if (action.includes('Uploaded')) return '⬆️'
    if (action.includes('Processed')) return '⚙️'
    if (action.includes('Updated')) return '✏️'
    return '🔄'
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="canvas-node bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">System Administration</h3>
        </div>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading system data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="canvas-node bg-white rounded-lg shadow-md border border-gray-200 flex flex-col h-full w-full">
      <NodeResizer
        minWidth={300}
        minHeight={250}
        shouldResize={() => true}
        handleStyle={{
          backgroundColor: '#6366f1',
          width: '8px',
          height: '8px',
          border: '2px solid white'
        }}
        lineStyle={{
          borderColor: '#6366f1',
          borderWidth: '2px'
        }}
      />
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">System Administration</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            🔧 Admin
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === 'metrics'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-white/60 hover:text-white/80'
          }`}
        >
          System Metrics
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === 'activity'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-white/60 hover:text-white/80'
          }`}
        >
          Recent Activity
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'metrics' && adminData && (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(adminData.system_metrics).map(([key, value]) => (
              <div key={key} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{getMetricIcon(key)}</span>
                  <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
                    {key.replace('_', ' ')}
                  </span>
                </div>
                <div className={`text-lg font-bold ${getMetricColor(key, value)}`}>
                  {key === 'uptime_percentage' ? `${value}%` : value}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && adminData && (
          <div className="space-y-2">
            {adminData.recent_activity.map((activity, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <span className="text-sm mt-0.5">{getActionIcon(activity.action)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white truncate">
                        {activity.user}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {activity.action}
                    </p>
                    <p className="text-xs text-blue-600 truncate">
                      {activity.resource}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-white/5 border-t border-white/10 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>System Status: Online</span>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )
}