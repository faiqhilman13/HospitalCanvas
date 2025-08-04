import React, { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
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
  const { labs } = data as LabResultsNodeData
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
      case 'critical': return 'text-red-700 bg-red-50 border-red-300'
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-300'
      case 'low': return 'text-yellow-700 bg-yellow-50 border-yellow-300'
      case 'normal': return 'text-green-700 bg-green-50 border-green-300'
      default: return 'text-gray-700 bg-gray-50 border-gray-300'
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
    <div className="canvas-node min-w-[350px] min-h-[250px]">
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        <TestTube className="w-5 h-5 text-clinical-blue" />
        <h3 className="font-semibold text-gray-900">Laboratory Results</h3>
      </div>

      {/* Lab Categories */}
      <div className="space-y-2 max-h-80 overflow-auto">
        {labs.map((category) => {
          const isExpanded = expandedCategories.has(category.category)
          const abnormalCount = category.tests.filter(test => test.flag !== 'normal').length
          
          return (
            <div key={category.category} className="border border-gray-200 rounded-lg">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-900">{category.category}</span>
                  {abnormalCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      {abnormalCount}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {category.tests.length} test{category.tests.length !== 1 ? 's' : ''}
                </span>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  {category.tests.map((test, index) => (
                    <div
                      key={index}
                      className={`p-3 ${index !== category.tests.length - 1 ? 'border-b border-gray-200' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 text-sm">{test.name}</span>
                            <div className={`px-1.5 py-0.5 rounded text-xs border flex items-center space-x-1 ${getFlagColor(test.flag)}`}>
                              {getFlagIcon(test.flag)}
                              <span className="capitalize">{test.flag}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Reference: {test.reference_range}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(test.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {test.value}
                          </div>
                          <div className="text-sm text-gray-600">
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