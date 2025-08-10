import { useState } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import type { CanvasNodeProps } from '../../types'


export default function AnalyticsReportNode({ data }: CanvasNodeProps) {
  const { title = 'Population Analytics', role = 'analyst' } = data
  const [loading] = useState(false)
  const [activeTab, setActiveTab] = useState<'metrics' | 'patterns' | 'medications'>('metrics')



  if (loading) {
    return (
      <div className="canvas-node">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="canvas-node flex flex-col h-full w-full">
      <NodeResizer 
        minWidth={300} 
        minHeight={250} 
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
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200">
            📊 {role}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-white/20">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === 'metrics'
              ? 'border-blue-400 text-blue-200'
              : 'border-transparent text-white/70 hover:text-white/90'
          }`}
        >
          Population
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === 'patterns'
              ? 'border-blue-400 text-blue-200'
              : 'border-transparent text-white/70 hover:text-white/90'
          }`}
        >
          Patterns
        </button>
        <button
          onClick={() => setActiveTab('medications')}
          className={`flex-1 px-4 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === 'medications'
              ? 'border-blue-400 text-blue-200'
              : 'border-transparent text-white/70 hover:text-white/90'
          }`}
        >
          Medications
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white flex items-center">
                    📊 Readmission Rate
                  </span>
                  <span className="text-xl font-bold text-red-200">12.3%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                  <div className="bg-red-400 h-2 rounded-full w-[12%]"></div>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-red-200">↑ +2.1%</span>
                  <span className="ml-2 text-white/70">vs last month</span>
                </div>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white flex items-center">
                    ❤️ Heart Disease Risk
                  </span>
                  <span className="text-xl font-bold text-orange-200">34.7%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                  <div className="bg-orange-400 h-2 rounded-full w-[35%]"></div>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-green-200">↓ -1.2%</span>
                  <span className="ml-2 text-white/70">vs last month</span>
                </div>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white flex items-center">
                    🩺 CKD Prevalence
                  </span>
                  <span className="text-xl font-bold text-yellow-200">28.9%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                  <div className="bg-yellow-400 h-2 rounded-full w-[29%]"></div>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-orange-200">↑ +0.8%</span>
                  <span className="ml-2 text-white/70">vs last month</span>
                </div>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white flex items-center">
                    🍯 Average HbA1c
                  </span>
                  <span className="text-xl font-bold text-blue-200">7.8%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                  <div className="bg-blue-400 h-2 rounded-full w-[78%]"></div>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-green-200">↓ -0.3%</span>
                  <span className="ml-2 text-white/70">vs last month</span>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white/10 border border-white/20 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                📈 Population Health Trends
              </h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-200">↑ 15%</div>
                  <div className="text-white/80">Medication Adherence</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-200">↑ 8%</div>
                  <div className="text-white/80">Prevention Programs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-200">↓ 22%</div>
                  <div className="text-white/80">Emergency Visits</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-4">
            {/* Critical Patterns */}
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-red-200 flex items-center">
                  ⚠️ Diabetic Nephropathy Progression
                </span>
                <span className="bg-red-500/20 text-red-200 px-3 py-1 rounded-full text-sm font-bold">
                  87% Confidence
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-red-200 font-medium">🏥 Affected Patients</div>
                  <div className="text-2xl font-bold text-white">3 patients</div>
                  <div className="text-xs text-white/70">Uncle Tan, Mrs. Chen, Mr. Kumar</div>
                </div>
                <div>
                  <div className="text-sm text-red-200 font-medium">📈 Risk Trend</div>
                  <div className="text-2xl font-bold text-red-200">↑ 23%</div>
                  <div className="text-xs text-white/70">Last 6 months</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-red-500/20 text-red-200 px-2 py-1 rounded text-xs">🔍 Proteinuria</span>
                <span className="bg-red-500/20 text-red-200 px-2 py-1 rounded text-xs">📉 Declining eGFR</span>
                <span className="bg-red-500/20 text-red-200 px-2 py-1 rounded text-xs">🍭 HbA1c &gt;8%</span>
              </div>
            </div>

            {/* Secondary Pattern */}
            <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-orange-200 flex items-center">
                  💊 Post-MI Medication Adherence
                </span>
                <span className="bg-orange-500/20 text-orange-200 px-3 py-1 rounded-full text-sm font-bold">
                  72% Confidence
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-orange-200 font-medium">👥 Affected Patients</div>
                  <div className="text-2xl font-bold text-white">2 patients</div>
                  <div className="text-xs text-white/70">Mr. Kumar, Uncle Tan</div>
                </div>
                <div>
                  <div className="text-sm text-orange-200 font-medium">✅ Adherence Rate</div>
                  <div className="text-2xl font-bold text-orange-200">78%</div>
                  <div className="text-xs text-white/70">Target: &gt;90%</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-orange-500/20 text-orange-200 px-2 py-1 rounded text-xs">💊 ACE Inhibitor</span>
                <span className="bg-orange-500/20 text-orange-200 px-2 py-1 rounded text-xs">🫀 Beta Blocker</span>
                <span className="bg-orange-500/20 text-orange-200 px-2 py-1 rounded text-xs">💉 Statin</span>
              </div>
            </div>

            {/* Emerging Pattern */}
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-200 flex items-center">
                  🔍 Emerging: Polypharmacy Patterns
                </span>
                <span className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded text-xs">
                  New Detection
                </span>
              </div>
              <div className="text-xs text-white/80">
                Patients with 5+ medications showing interaction patterns
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="space-y-4">
            {/* Top Medications */}
            <div className="grid grid-cols-1 gap-3">
              {/* Lisinopril - ACE Inhibitor */}
              <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💊</span>
                    <div>
                      <div className="text-lg font-semibold text-green-200">Lisinopril</div>
                      <div className="text-xs text-white/70">ACE Inhibitor • 10mg daily</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-500/20 text-green-200 px-3 py-1 rounded-full text-sm font-bold">
                      92% Effective
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">847</div>
                    <div className="text-white/80">Total Prescribed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-200">$12.50</div>
                    <div className="text-white/80">Avg Monthly Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-200">23</div>
                    <div className="text-white/80">Side Effects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-200">89%</div>
                    <div className="text-white/80">Adherence Rate</div>
                  </div>
                </div>
              </div>

              {/* Metformin - Diabetes */}
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🍯</span>
                    <div>
                      <div className="text-lg font-semibold text-blue-200">Metformin</div>
                      <div className="text-xs text-white/70">Diabetes • 1000mg BID</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-bold">
                      88% Effective
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">1,234</div>
                    <div className="text-white/80">Total Prescribed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-200">$8.75</div>
                    <div className="text-white/80">Avg Monthly Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-200">45</div>
                    <div className="text-white/80">Side Effects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-200">94%</div>
                    <div className="text-white/80">Adherence Rate</div>
                  </div>
                </div>
              </div>

              {/* Atorvastatin - Statin */}
              <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🧬</span>
                    <div>
                      <div className="text-lg font-semibold text-purple-200">Atorvastatin</div>
                      <div className="text-xs text-white/70">Statin • 40mg daily</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm font-bold">
                      85% Effective
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">692</div>
                    <div className="text-white/80">Total Prescribed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-200">$45.20</div>
                    <div className="text-white/80">Avg Monthly Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-200">67</div>
                    <div className="text-white/80">Side Effects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-200">82%</div>
                    <div className="text-white/80">Adherence Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medication Summary */}
            <div className="bg-white/10 border border-white/20 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                💰 Cost-Effectiveness Analysis
              </h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-200">$2.8M</div>
                  <div className="text-white/80">Annual Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-200">94%</div>
                  <div className="text-white/80">Optimal Prescribing</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-200">8.2</div>
                  <div className="text-white/80">Avg Medications</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-white/5 border-t border-white/20">
        <div className="text-xs text-white/70 text-center">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}