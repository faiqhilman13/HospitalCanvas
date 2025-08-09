import React from 'react'

// Skeleton Components for Loading States
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-panel p-6 animate-pulse ${className}`}>
    <div className="flex items-center space-x-4">
      <div className="skeleton w-12 h-12 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 rounded w-3/4"></div>
        <div className="skeleton h-3 rounded w-1/2"></div>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="skeleton h-3 rounded"></div>
      <div className="skeleton h-3 rounded w-5/6"></div>
      <div className="skeleton h-3 rounded w-2/3"></div>
    </div>
  </div>
)

export const SkeletonChart: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-panel p-6 animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="skeleton h-6 rounded w-1/3"></div>
      <div className="skeleton h-4 rounded w-16"></div>
    </div>
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="skeleton w-12 h-8 rounded"></div>
          <div className="skeleton h-8 rounded flex-1"></div>
          <div className="skeleton w-16 h-8 rounded"></div>
        </div>
      ))}
    </div>
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className = '' 
}) => (
  <div className={`glass-panel p-6 animate-pulse ${className}`}>
    {/* Header */}
    <div className="flex space-x-4 mb-4 pb-2 border-b border-gray-200">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton h-4 rounded flex-1"></div>
      ))}
    </div>
    
    {/* Rows */}
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          {[...Array(4)].map((_, j) => (
            <div key={j} className={`skeleton h-4 rounded ${j === 0 ? 'w-1/4' : 'flex-1'}`}></div>
          ))}
        </div>
      ))}
    </div>
  </div>
)

// Loading Spinner Components
export const LoadingSpinner: React.FC<{ 
  size?: 'small' | 'medium' | 'large'
  color?: string
  className?: string 
}> = ({ 
  size = 'medium', 
  color = 'text-blue-600',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <svg 
      className={`animate-spin ${sizeClasses[size]} ${color} ${className}`} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Advanced Loading Components
export const PulsingDots: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex space-x-2 ${className}`}>
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
)

export const LoadingWave: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center space-x-1 ${className}`}>
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="w-1 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full animate-bounce"
        style={{ 
          height: `${12 + (i % 2) * 8}px`,
          animationDelay: `${i * 0.1}s`,
          animationDuration: '1.4s'
        }}
      />
    ))}
  </div>
)

// Clinical Loading Components
export const MedicalPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative ${className}`}>
    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500 opacity-75"></div>
    <div className="absolute top-0 left-0 w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-ping"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>
  </div>
)

// Full Page Loading Component
export const FullPageLoader: React.FC<{
  message?: string
  showProgress?: boolean
  progress?: number
}> = ({ 
  message = 'Loading patient data...', 
  showProgress = false,
  progress = 0 
}) => (
  <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="glass-panel p-8 text-center max-w-md w-full mx-4">
      {/* Loading Animation */}
      <div className="mb-6 flex justify-center">
        <MedicalPulse />
      </div>
      
      {/* Message */}
      <h3 className="text-lg font-semibold text-white mb-2">
        {message}
      </h3>
      
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-300 mt-2">{Math.round(progress)}% complete</p>
        </div>
      )}
      
      {/* Loading Dots */}
      <PulsingDots />
    </div>
  </div>
)

// Canvas Node Loading States
export const NodeLoadingSkeleton: React.FC<{ 
  nodeType: 'summary' | 'chart' | 'timeline' | 'documents' | 'default'
  className?: string 
}> = ({ nodeType, className = '' }) => {
  const getSkeletonContent = () => {
    switch (nodeType) {
      case 'summary':
        return (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <div className="skeleton w-12 h-12 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-5 rounded w-3/4"></div>
                <div className="skeleton h-3 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-3 rounded"></div>
              ))}
            </div>
          </>
        )
      
      case 'chart':
        return (
          <>
            <div className="skeleton h-6 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="skeleton w-16 h-8 rounded"></div>
                  <div className="skeleton h-8 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </>
        )
      
      case 'timeline':
        return (
          <>
            <div className="skeleton h-6 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="skeleton w-3 h-3 rounded-full mt-1"></div>
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 rounded w-3/4"></div>
                    <div className="skeleton h-3 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      
      case 'documents':
        return (
          <>
            <div className="skeleton h-6 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-16 rounded"></div>
              ))}
            </div>
          </>
        )
      
      default:
        return (
          <>
            <div className="skeleton h-6 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-4 rounded"></div>
              ))}
            </div>
          </>
        )
    }
  }

  return (
    <div className={`glass-panel p-6 animate-pulse ${className}`}>
      {getSkeletonContent()}
      
      {/* Loading indicator */}
      <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-200">
        <LoadingSpinner size="small" className="mr-2" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    </div>
  )
}

// Error State Component
export const ErrorState: React.FC<{
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}> = ({ 
  title = 'Something went wrong',
  message = 'Please try again or contact support if the problem persists.',
  onRetry,
  className = ''
}) => (
  <div className={`glass-panel p-8 text-center ${className}`}>
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{message}</p>
    
    {onRetry && (
      <button
        onClick={onRetry}
        className="clinical-button clinical-button-primary"
      >
        Try Again
      </button>
    )}
  </div>
)