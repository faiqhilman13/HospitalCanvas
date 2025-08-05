import React from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { TrendingDown, TrendingUp, Activity } from 'lucide-react'
import type { CanvasNodeProps, VitalsChartNodeData } from '../../types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const VitalsChartNode: React.FC<CanvasNodeProps> = ({ data }) => {
  // Handle both data structures: backend format and expected format
  let vitals: VitalSign[]
  let title: string

  if (data.vitals) {
    // Expected format from VitalsChartNodeData
    vitals = data.vitals
    title = data.title || 'Vitals Chart'
  } else if (data.vitalsData) {
    // Backend format - convert vitalsData array to VitalSign format
    vitals = [{
      name: data.chartType === 'trend' ? 'Vital Signs' : 'Vitals',
      values: data.vitalsData.map((vital: any[]) => ({
        date: vital[4],
        value: vital[1],
        unit: vital[2],
        reference_range: vital[3]
      }))
    }]
    title = 'Vitals Chart'
  } else {
    // Fallback - no valid data
    console.warn('VitalsChartNode: No valid vitals data provided', data)
    return (
      <div className="canvas-node min-w-[400px] min-h-[300px]">
        <Handle type="target" position={Position.Top} />
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No vitals data available</p>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    )
  }

  // Safety check - ensure we have valid data
  if (!vitals || vitals.length === 0 || !vitals[0] || !vitals[0].values || vitals[0].values.length === 0) {
    console.warn('VitalsChartNode: Invalid vitals data structure', vitals)
    return (
      <div className="canvas-node min-w-[400px] min-h-[300px]">
        <Handle type="target" position={Position.Top} />
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Invalid vitals data</p>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    )
  }

  // Prepare chart data
  const vital = vitals[0] // For demo, show first vital
  const chartData = {
    labels: vital.values.map(v => new Date(v.date).toLocaleDateString()),
    datasets: [
      {
        label: vital.name,
        data: vital.values.map(v => parseFloat(v.value)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = vital.values[context.dataIndex]
            return `${vital.name}: ${value.value} ${value.unit}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  }

  // Calculate trend
  const firstValue = parseFloat(vital.values[0].value)
  const lastValue = parseFloat(vital.values[vital.values.length - 1].value)
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable'
  const trendPercent = Math.abs(((lastValue - firstValue) / firstValue) * 100)

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    // For kidney function (eGFR), down trend is bad
    if (vital.name.toLowerCase().includes('egfr')) {
      return trend === 'down' ? 'text-red-600' : trend === 'up' ? 'text-green-600' : 'text-gray-600'
    }
    // For most other vitals, up trend might be concerning
    return trend === 'up' ? 'text-red-600' : trend === 'down' ? 'text-green-600' : 'text-gray-600'
  }

  return (
    <div className="canvas-node min-w-[400px] min-h-[300px]">
      <NodeResizer 
        minWidth={350} 
        minHeight={250} 
        maxWidth={700}
        maxHeight={600}
        shouldResize={() => true}
        handleStyle={{
          backgroundColor: '#10b981',
          width: '8px',
          height: '8px',
          border: '2px solid white',
        }}
        lineStyle={{
          borderColor: '#10b981',
          borderWidth: '2px',
        }}
      />
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-clinical-blue" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        
        {/* Trend Indicator */}
        <div className={`flex items-center space-x-1 text-sm font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>
            {trend === 'stable' ? 'Stable' : `${trendPercent.toFixed(1)}% ${trend}`}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 mb-3">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Latest Value */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Latest Value</span>
          <div className="text-right">
            <div className="font-semibold text-gray-900">
              {vital.values[vital.values.length - 1].value} {vital.values[vital.values.length - 1].unit}
            </div>
            <div className="text-xs text-gray-500">
              Ref: {vital.values[vital.values.length - 1].reference_range}
            </div>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default VitalsChartNode