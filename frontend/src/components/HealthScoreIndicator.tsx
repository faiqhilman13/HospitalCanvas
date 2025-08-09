import React, { useEffect, useState } from 'react'

interface HealthScoreIndicatorProps {
  score: number // 0-100
  label: string
  size?: 'small' | 'medium' | 'large'
  showAnimation?: boolean
  critical?: boolean
  warning?: boolean
  className?: string
}

const HealthScoreIndicator: React.FC<HealthScoreIndicatorProps> = ({
  score,
  label,
  size = 'medium',
  showAnimation = true,
  critical = false,
  warning = false,
  className = ''
}) => {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Determine status based on score and props
  const getStatus = () => {
    if (critical) return 'critical'
    if (warning) return 'warning'
    if (score >= 80) return 'excellent'
    if (score >= 60) return 'good'
    if (score >= 40) return 'fair'
    return 'poor'
  }

  const status = getStatus()

  // Size configurations
  const sizeConfig = {
    small: {
      containerSize: 'w-16 h-16',
      strokeWidth: 3,
      fontSize: 'text-xs',
      labelSize: 'text-xs'
    },
    medium: {
      containerSize: 'w-24 h-24',
      strokeWidth: 4,
      fontSize: 'text-sm',
      labelSize: 'text-sm'
    },
    large: {
      containerSize: 'w-32 h-32',
      strokeWidth: 5,
      fontSize: 'text-lg',
      labelSize: 'text-base'
    }
  }

  const config = sizeConfig[size]
  const radius = size === 'small' ? 28 : size === 'medium' ? 40 : 52
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  // Color schemes based on status
  const getColors = () => {
    switch (status) {
      case 'critical':
        return {
          primary: '#ef4444',
          secondary: '#fca5a5',
          gradient: 'from-red-500 to-red-600',
          glow: 'shadow-red-500/20'
        }
      case 'warning':
        return {
          primary: '#f59e0b',
          secondary: '#fcd34d',
          gradient: 'from-amber-500 to-amber-600',
          glow: 'shadow-amber-500/20'
        }
      case 'excellent':
        return {
          primary: '#10b981',
          secondary: '#6ee7b7',
          gradient: 'from-emerald-500 to-emerald-600',
          glow: 'shadow-emerald-500/20'
        }
      case 'good':
        return {
          primary: '#06b6d4',
          secondary: '#67e8f9',
          gradient: 'from-cyan-500 to-cyan-600',
          glow: 'shadow-cyan-500/20'
        }
      case 'fair':
        return {
          primary: '#3b82f6',
          secondary: '#93c5fd',
          gradient: 'from-blue-500 to-blue-600',
          glow: 'shadow-blue-500/20'
        }
      default:
        return {
          primary: '#6b7280',
          secondary: '#d1d5db',
          gradient: 'from-gray-500 to-gray-600',
          glow: 'shadow-gray-500/20'
        }
    }
  }

  const colors = getColors()

  // Animation effect
  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [showAnimation])

  useEffect(() => {
    if (isVisible && showAnimation) {
      const duration = 2000 // 2 seconds
      const steps = 60
      const increment = score / steps
      let currentStep = 0

      const timer = setInterval(() => {
        currentStep++
        const easeOutProgress = 1 - Math.pow(1 - currentStep / steps, 3)
        setAnimatedScore(Math.min(score * easeOutProgress, score))

        if (currentStep >= steps) {
          setAnimatedScore(score)
          clearInterval(timer)
        }
      }, duration / steps)

      return () => clearInterval(timer)
    } else {
      setAnimatedScore(score)
    }
  }, [score, isVisible, showAnimation])

  return (
    <div className={`relative flex flex-col items-center gap-2 ${className}`}>
      {/* Main Ring Container */}
      <div 
        className={`
          relative ${config.containerSize} 
          ${status === 'critical' || status === 'warning' ? 'health-score-ring ' + status : 'health-score-ring good'}
        `}
      >
        {/* Background Ring */}
        <svg
          className="absolute inset-0 transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 120 120"
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={config.strokeWidth}
            fill="none"
            opacity="0.2"
          />
        </svg>

        {/* Progress Ring */}
        <svg
          className="absolute inset-0 transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 120 120"
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={colors.primary}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${colors.primary}40)`
            }}
          />
        </svg>

        {/* Inner Glow */}
        <div 
          className={`
            absolute inset-2 rounded-full bg-gradient-to-br ${colors.gradient} 
            opacity-10 ${showAnimation ? 'animate-pulse' : ''}
          `}
        />

        {/* Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className={`font-bold ${config.fontSize} text-white`}
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
          >
            {Math.round(animatedScore)}
          </span>
          {size !== 'small' && (
            <span className="text-xs text-white/80 font-medium">
              {status === 'critical' ? 'CRITICAL' : 
               status === 'warning' ? 'WARNING' : 
               status === 'excellent' ? 'EXCELLENT' :
               status === 'good' ? 'GOOD' :
               status === 'fair' ? 'FAIR' : 'POOR'}
            </span>
          )}
        </div>

        {/* Pulsing Ring for Critical/Warning */}
        {(status === 'critical' || status === 'warning') && showAnimation && (
          <div 
            className={`
              absolute inset-0 rounded-full border-2 
              ${status === 'critical' ? 'border-red-500' : 'border-amber-500'}
              animate-ping opacity-20
            `}
          />
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <p className={`${config.labelSize} font-semibold text-white mb-1`}>
          {label}
        </p>
        
        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-1">
          <div 
            className={`
              w-2 h-2 rounded-full 
              ${status === 'critical' ? 'bg-red-500' :
                status === 'warning' ? 'bg-amber-500' :
                status === 'excellent' ? 'bg-emerald-500' :
                status === 'good' ? 'bg-cyan-500' :
                status === 'fair' ? 'bg-blue-500' : 'bg-gray-500'}
              ${showAnimation ? 'animate-pulse' : ''}
            `}
          />
          <span className="text-xs text-white/70 uppercase tracking-wide">
            {status}
          </span>
        </div>
      </div>

      {/* Floating Particles Effect for Excellent Scores */}
      {status === 'excellent' && showAnimation && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-bounce opacity-60"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HealthScoreIndicator