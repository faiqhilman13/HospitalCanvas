import React, { useState } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import { TestTube, ChevronDown, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react'
import type { CanvasNodeProps } from '../../types'

interface LabResultsNodeData {
  labs: Array<{
    category: string
    tests: Array<{
      name: string
      value: string
      unit: string
      reference_range: string
      flag: 'normal' | 'high' | 'low' | 'critical'
      date: string
    }>
  }>
}

const LabResultsNode: React.FC<CanvasNodeProps> = ({ data }) => {
  // Handle both data structures: backend format and expected format
  let labs: Array<{
    category: string
    tests: Array<{
      name: string
      value: string
      unit: string
      reference_range: string
      flag: 'normal' | 'high' | 'low' | 'critical'
      date: string
    }>
  }>

  if (data.labs) {
    // Expected format
    labs = data.labs
  } else if (data.labData) {
    // Backend format - convert labData array to labs format
    const categorizedTests: Record<string, any[]> = {}
    
    data.labData.forEach((lab: any[]) => {
      const [name, value, unit, reference_range, date] = lab
      
      // Categorize tests based on name
      let category = 'General'
      const lowerName = name.toLowerCase()
      
      if (lowerName.includes('creatinine') || lowerName.includes('bun') || lowerName.includes('egfr')) {
        category = 'Renal Function'
      } else if (lowerName.includes('hemoglobin') || lowerName.includes('hematocrit')) {
        category = 'Hematology'
      } else if (lowerName.includes('potassium') || lowerName.includes('sodium') || lowerName.includes('chloride')) {
        category = 'Electrolytes'
      } else if (lowerName.includes('albumin') || lowerName.includes('protein')) {
        category = 'Protein Studies'
      } else if (lowerName.includes('phosphorus') || lowerName.includes('calcium') || lowerName.includes('parathyroid')) {
        category = 'Bone/Mineral'
      }
      
      if (!categorizedTests[category]) {
        categorizedTests[category] = []
      }
      
      // Determine flag based on value and reference range (simplified logic)
      let flag: 'normal' | 'high' | 'low' | 'critical' = 'normal'
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && reference_range && reference_range !== 'N/A') {
        // This is a simplified flag determination - in reality this would be more complex
        if (reference_range.includes('-')) {
          const [min, max] = reference_range.split('-').map(s => parseFloat(s.trim()))
          if (!isNaN(min) && !isNaN(max)) {
            if (numValue < min) flag = 'low'
            else if (numValue > max) flag = 'high'
          }
        } else if (reference_range.startsWith('>')) {
          const min = parseFloat(reference_range.substring(1))
          if (!isNaN(min) && numValue < min) flag = 'low'
        }
      }
      
      categorizedTests[category].push({
        name,
        value,
        unit,
        reference_range,
        flag,
        date
      })
    })
    
    labs = Object.entries(categorizedTests).map(([category, tests]) => ({
      category,
      tests
    }))
  } else {
    // Fallback - no valid data
    console.warn('LabResultsNode: No valid lab data provided', data)
    return (
      <div className="canvas-node">
        <Handle type="target" position={Position.Top} />
        <div className="flex items-center justify-center h-full">
          <p className="text-white/70">No lab data available</p>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    )
  }

  // Safety check
  if (!labs || labs.length === 0) {
    console.warn('LabResultsNode: Empty labs data', labs)
    return (
      <div className="canvas-node">
        <Handle type="target" position={Position.Top} />
        <div className="flex items-center justify-center h-full">
          <p className="text-white/70">No lab results available</p>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    )
  }

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Renal Function']))

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  const getFlagColor = (flag: string) => {
    switch (flag) {
      case 'critical': return 'text-red-300 bg-red-500/20 border-red-400/30'
      case 'high': return 'text-orange-300 bg-orange-500/20 border-orange-400/30'
      case 'low': return 'text-yellow-300 bg-yellow-500/20 border-yellow-400/30'
      case 'normal': return 'text-green-300 bg-green-500/20 border-green-400/30'
      default: return 'text-white/70 bg-white/10 border-white/20'
    }
  }

  const getFlagIcon = (flag: string) => {
    switch (flag) {
      case 'critical':
      case 'high':
      case 'low':
        return <AlertTriangle className="w-3 h-3" />
      case 'normal':
        return <CheckCircle className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <div className="canvas-node flex flex-col h-full w-full">
      <NodeResizer
        minWidth={300}
        minHeight={250}
        shouldResize={() => true}
        handleStyle={{
          backgroundColor: '#f97316',
          width: '8px',
          height: '8px',
          border: '2px solid white'
        }}
        lineStyle={{
          borderColor: '#f97316',
          borderWidth: '2px'
        }}
      />
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        <TestTube className="w-5 h-5 text-white" />
        <h3 className="font-semibold text-white">Laboratory Results</h3>
      </div>

      {/* Lab Categories */}
      <div className="space-y-2 max-h-80 overflow-auto">
        {labs.map((category) => {
          const isExpanded = expandedCategories.has(category.category)
          const abnormalCount = category.tests.filter(test => test.flag !== 'normal').length
          
          return (
            <div key={category.category} className="border border-white/10 rounded-lg">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white/70" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white/70" />
                  )}
                  <span className="font-medium text-white">{category.category}</span>
                  {abnormalCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full">
                      {abnormalCount}
                    </span>
                  )}
                </div>
                <span className="text-sm text-white/70">
                  {category.tests.length} test{category.tests.length !== 1 ? 's' : ''}
                </span>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <div className="border-t border-white/10 bg-white/5">
                  {category.tests.map((test, index) => (
                    <div
                      key={index}
                      className={`p-3 ${index !== category.tests.length - 1 ? 'border-b border-white/10' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white text-sm">{test.name}</span>
                            <div className={`px-1.5 py-0.5 rounded text-xs border flex items-center space-x-1 ${getFlagColor(test.flag)}`}>
                              {getFlagIcon(test.flag)}
                              <span className="capitalize">{test.flag}</span>
                            </div>
                          </div>
                          <div className="text-sm text-white/70 mt-1">
                            Reference: {test.reference_range}
                          </div>
                          <div className="text-xs text-white/50 mt-1">
                            {new Date(test.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-white">
                            {test.value}
                          </div>
                          <div className="text-sm text-white/70">
                            {test.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default LabResultsNode