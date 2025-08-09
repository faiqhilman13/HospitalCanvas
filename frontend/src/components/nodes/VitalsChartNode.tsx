import React, { useEffect, useRef } from 'react'
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
  Filler,
} from 'chart.js'
import { TrendingDown, TrendingUp, Activity, Heart, AlertCircle } from 'lucide-react'
import type { CanvasNodeProps, VitalsChartNodeData, VitalSign } from '../../types'
import HealthScoreIndicator from '../HealthScoreIndicator'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
      <div className="canvas-node animate-fade-in">
        <Handle 
          type="target" 
          position={Position.Top} 
          style={{
            backgroundColor: '#06b6d4',
            border: '2px solid white',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
          }}
        />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-white/50 mx-auto mb-2" />
            <p className="text-white/80 font-medium">No vitals data available</p>
            <p className="text-white/60 text-sm mt-1">Please load patient data</p>
          </div>
        </div>
        <Handle 
          type="source" 
          position={Position.Bottom} 
          style={{
            backgroundColor: '#8b5cf6',
            border: '2px solid white',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}
        />
      </div>
    )
  }

  // Safety check - ensure we have valid data
  if (!vitals || vitals.length === 0 || !vitals[0] || !vitals[0].values || vitals[0].values.length === 0) {
    console.warn('VitalsChartNode: Invalid vitals data structure', vitals)
    return (
      <div className="canvas-node animate-fade-in">
        <Handle 
          type="target" 
          position={Position.Top} 
          style={{
            backgroundColor: '#06b6d4',
            border: '2px solid white',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
          }}
        />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-pulse" />
            <p className="text-white/80 font-medium">Invalid vitals data</p>
            <p className="text-white/60 text-sm mt-1">Please check data format</p>
          </div>
        </div>
        <Handle 
          type="source" 
          position={Position.Bottom} 
          style={{
            backgroundColor: '#8b5cf6',
            border: '2px solid white',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}
        />
      </div>
    )
  }

  // Calculate vital health score
  const calculateVitalScore = (vital: any) => {
    const latestValue = parseFloat(vital.values[vital.values.length - 1].value)
    
    // Example scoring logic for different vitals
    if (vital.name.toLowerCase().includes('egfr')) {
      return latestValue >= 60 ? 85 : latestValue >= 30 ? 60 : 25
    } else if (vital.name.toLowerCase().includes('blood pressure')) {
      return latestValue < 140 ? 80 : latestValue < 160 ? 60 : 30
    }
    return 75 // Default score
  }

  // Prepare enhanced chart data
  const vital = vitals[0] // For demo, show first vital
  const values = vital.values.map(v => parseFloat(v.value))
  const hasWarning = values.some(v => v < 30) // Example warning logic
  
  const chartData = {
    labels: vital.values.map(v => new Date(v.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })),
    datasets: [
      {
        label: vital.name,
        data: values,
        borderColor: hasWarning ? '#ef4444' : '#10b981',
        backgroundColor: hasWarning ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: hasWarning ? '#ef4444' : '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
        pointHoverBackgroundColor: hasWarning ? '#dc2626' : '#059669',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: hasWarning ? '#ef4444' : '#10b981',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            return `${vital.name}`
          },
          label: function(context: any) {
            const value = vital.values[context.dataIndex]
            return `${value.value} ${value.unit}`
          },
          afterLabel: function(context: any) {
            const value = vital.values[context.dataIndex]
            return `Reference: ${value.reference_range}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderDash: [2, 2],
        },
        border: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 11,
            weight: '500',
          },
          callback: function(value: any) {
            return `${value} ${vital.values[0].unit}`
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderDash: [2, 2],
        },
        border: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 11,
            weight: '500',
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'easeInOutQuad',
        from: 0.1,
        to: 0.3,
        loop: false
      }
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
        return <Activity className="w-4 h-4 text-white/70" />
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

  const vitalScore = calculateVitalScore(vital)
  const latestValue = vital.values[vital.values.length - 1]

  return (
    <div className={`canvas-node flex flex-col h-full w-full animate-fade-in hover-lift ${
      hasWarning ? 'critical' : vitalScore < 60 ? 'warning' : 'success'
    }`}>
      <NodeResizer 
        minWidth={300} 
        minHeight={250} 
        shouldResize={() => true}
        handleStyle={{
          backgroundColor: '#10b981',
          width: '10px',
          height: '10px',
          border: '2px solid white',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}
        lineStyle={{
          borderColor: '#10b981',
          borderWidth: '2px',
          borderStyle: 'dashed'
        }}
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{
          backgroundColor: '#06b6d4',
          border: '2px solid white',
          boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
        }}
      />
      
      {/* Enhanced Header with Health Score */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
              hasWarning 
                ? 'bg-gradient-to-br from-red-500 to-red-600' 
                : 'bg-gradient-to-br from-green-500 to-emerald-600'
            }`}>
              {hasWarning ? (
                <AlertCircle className="w-6 h-6 text-white" />
              ) : (
                <Heart className="w-6 h-6 text-white animate-pulse" />
              )}
            </div>
            {hasWarning && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white text-gradient">
              {title}
            </h3>
            <p className="text-sm text-white/80">
              {vital.name} • Trend Analysis
            </p>
            <div className={`flex items-center space-x-1 text-sm font-medium mt-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-white/90">
                {trend === 'stable' ? 'Stable' : `${trendPercent.toFixed(1)}% ${trend}`}
              </span>
            </div>
          </div>
        </div>
        
        {/* Vital Score Indicator */}
        <div className="flex flex-col items-center space-y-2">
          <HealthScoreIndicator
            score={vitalScore}
            label="Vital Score"
            size="small"
            critical={hasWarning}
            warning={vitalScore < 60}
            showAnimation={true}
          />
        </div>
      </div>

      {/* Enhanced Chart Container */}
      <div className="glass-panel p-4 mb-4 animate-scale-in">
        <div className="h-52 relative">
          <Line data={chartData} options={chartOptions as any} />
          
          {/* Chart Overlay Effects */}
          {hasWarning && (
            <div className="absolute top-2 right-2 flex items-center space-x-1 text-red-400 text-xs animate-pulse">
              <AlertCircle className="w-3 h-3" />
              <span>Critical Values</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Latest Value Display */}
      <div className="glass-panel p-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              hasWarning ? 'bg-red-400 animate-pulse' : 'bg-green-400'
            }`}></div>
            <span className="text-white/80 font-medium">Latest Reading</span>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${
              hasWarning ? 'text-red-300' : 'text-green-300'
            }`}>
              {latestValue.value} {latestValue.unit}
            </div>
            <div className="text-xs text-white/60">
              Reference: {latestValue.reference_range}
            </div>
            <div className="text-xs text-white/50 mt-1">
              {new Date(latestValue.date).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/20">
          <div className="text-center">
            <div className="text-xs text-white/60">Min</div>
            <div className="text-sm font-semibold text-white/90">
              {Math.min(...values).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/60">Avg</div>
            <div className="text-sm font-semibold text-white/90">
              {(values.reduce((a, b) => a + b) / values.length).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/60">Max</div>
            <div className="text-sm font-semibold text-white/90">
              {Math.max(...values).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{
          backgroundColor: '#8b5cf6',
          border: '2px solid white',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
        }}
      />
    </div>
  )
}

export default VitalsChartNode