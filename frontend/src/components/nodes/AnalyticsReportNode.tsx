import { useState, useEffect } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import type { CanvasNodeProps } from '../../types'

interface PopulationMetric {
  metric_name: string
  value: number
  trend_direction: 'up' | 'down' | 'stable'
  change_percentage: number
  period: string
}

interface DiseasePattern {
  pattern_name: string
  confidence_score: number
  affected_patients: number
  key_indicators: string[]
  trend_data: Array<{
    date: string
    prevalence: number
  }>
}

interface MedicationAnalytic {
  medication_name: string
  usage_count: number
  effectiveness_score: number
  side_effects_reported: number
  cost_analysis: {
    average_cost: number
    total_prescribed: number
  }
}

export default function AnalyticsReportNode({ id, data }: CanvasNodeProps) {
  const { title = 'Population Analytics', role = 'analyst' } = data
  const [analyticsData, setAnalyticsData] = useState<{
    population_metrics: PopulationMetric[]
    disease_patterns: DiseasePattern[]
    medications: MedicationAnalytic[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'metrics' | 'patterns' | 'medications'>('metrics')

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        const [metricsRes, patternsRes, medicationsRes] = await Promise.all([
          fetch('http://localhost:8000/api/analytics/population/metrics'),
          fetch('http://localhost:8000/api/analytics/disease-patterns'),
          fetch('http://localhost:8000/api/analytics/medications')
        ])

        const [metrics, patterns, medications] = await Promise.all([
          metricsRes.json(),
          patternsRes.json(),
          medicationsRes.json()
        ])

        setAnalyticsData({
          population_metrics: metrics,
          disease_patterns: patterns,
          medications: medications
        })
      } catch (error) {
        console.error('Failed to fetch analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '📈'
      case 'down': return '📉'
      case 'stable': return '➡️'
      default: return '➡️'
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="canvas-node bg-white rounded-lg shadow-md border border-gray-200 min-w-[300px] min-h-[250px]">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="canvas-node bg-white rounded-lg shadow-md border border-gray-200 min-w-[300px] min-h-[250px] flex flex-col">
      <NodeResizer 
        minWidth={300} 
        minHeight={250} 
        maxWidth={600}
        maxHeight={500}
        shouldResize={() => true}
        handleStyle={{
          backgroundColor: '#8b5cf6',
          width: '8px',
          height: '8px',
          border: '2px solid white',
        }}
        lineStyle={{
          borderColor: '#8b5cf6',
          borderWidth: '2px',
        }}
      />
      <Handle type="target" position={Position.Top} />
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            📊 {role}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === 'metrics'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Population
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === 'patterns'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Patterns
        </button>
        <button
          onClick={() => setActiveTab('medications')}
          className={`flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === 'medications'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Medications
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'metrics' && analyticsData?.population_metrics && (
          <div className="space-y-3">
            {analyticsData.population_metrics.slice(0, 4).map((metric, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {metric.metric_name}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {metric.value}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-xs">
                  {getTrendIcon(metric.trend_direction)}
                  <span className={`ml-1 ${
                    metric.change_percentage > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change_percentage > 0 ? '+' : ''}{metric.change_percentage}%
                  </span>
                  <span className="ml-2 text-gray-500">({metric.period})</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'patterns' && analyticsData?.disease_patterns && (
          <div className="space-y-3">
            {analyticsData.disease_patterns.slice(0, 3).map((pattern, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {pattern.pattern_name}
                  </span>
                  <span className={`text-xs font-medium ${getConfidenceColor(pattern.confidence_score)}`}>
                    {Math.round(pattern.confidence_score * 100)}%
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  {pattern.affected_patients} patients affected
                </div>
                <div className="flex flex-wrap gap-1">
                  {pattern.key_indicators?.slice(0, 2).map((indicator, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                    >
                      {indicator}
                    </span>
                  )) || []}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'medications' && analyticsData?.medications && (
          <div className="space-y-3">
            {analyticsData.medications.slice(0, 3).map((med, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {med.medication_name}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    {Math.round(med.effectiveness_score * 100)}% effective
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>Usage: {med.usage_count}</div>
                  <div>Cost: ${med.cost_analysis?.average_cost || 'N/A'}</div>
                  <div>Side Effects: {med.side_effects_reported}</div>
                  <div>Total Rx: {med.cost_analysis?.total_prescribed || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}