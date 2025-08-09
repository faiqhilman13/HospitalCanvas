import React, { useEffect, useState, useCallback } from 'react'

interface Notification {
  id: string
  type: 'critical' | 'warning' | 'success' | 'info'
  title: string
  message: string
  timestamp: Date
  duration?: number // Auto dismiss in ms (0 = persist)
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationSystemProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  maxVisible?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

const NotificationItem: React.FC<{
  notification: Notification
  onDismiss: (id: string) => void
  isExiting: boolean
}> = ({ notification, onDismiss, isExiting }) => {
  const [progress, setProgress] = useState(100)

  // Auto-dismiss timer
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const interval = 50 // Update every 50ms for smooth progress
      const decrement = (100 / notification.duration) * interval

      const timer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - decrement
          if (newProgress <= 0) {
            clearInterval(timer)
            onDismiss(notification.id)
            return 0
          }
          return newProgress
        })
      }, interval)

      return () => clearInterval(timer)
    }
  }, [notification.duration, notification.id, onDismiss])

  const getIcon = () => {
    switch (notification.type) {
      case 'critical':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'success':
        return (
          <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getBorderColor = () => {
    switch (notification.type) {
      case 'critical': return 'border-l-red-500'
      case 'warning': return 'border-l-amber-500'
      case 'success': return 'border-l-emerald-500'
      case 'info': return 'border-l-cyan-500'
    }
  }

  const getProgressColor = () => {
    switch (notification.type) {
      case 'critical': return 'bg-red-500'
      case 'warning': return 'bg-amber-500'
      case 'success': return 'bg-emerald-500'
      case 'info': return 'bg-cyan-500'
    }
  }

  return (
    <div 
      className={`
        glass-panel p-4 border-l-4 ${getBorderColor()} 
        transform transition-all duration-500 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        animate-slide-in-right hover-lift max-w-sm w-full
      `}
    >
      {/* Progress Bar for Timed Notifications */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {notification.title}
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => onDismiss(notification.id)}
              className="ml-2 inline-flex text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Timestamp */}
          <p className="mt-2 text-xs text-gray-500">
            {notification.timestamp.toLocaleTimeString()}
          </p>

          {/* Action Button */}
          {notification.action && (
            <div className="mt-3 flex">
              <button
                onClick={notification.action.onClick}
                className="clinical-button clinical-button-secondary text-xs py-1 px-3"
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
  maxVisible = 5,
  position = 'top-right'
}) => {
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set())

  const handleDismiss = useCallback((id: string) => {
    setExitingIds(prev => new Set([...prev, id]))
    setTimeout(() => {
      onDismiss(id)
      setExitingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }, 500) // Match the CSS transition duration
  }, [onDismiss])

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right': return 'top-4 right-4'
      case 'top-left': return 'top-4 left-4'
      case 'bottom-right': return 'bottom-4 right-4'
      case 'bottom-left': return 'bottom-4 left-4'
    }
  }

  const visibleNotifications = notifications.slice(0, maxVisible)

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-3 pointer-events-none`}>
      {visibleNotifications.map(notification => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            notification={notification}
            onDismiss={handleDismiss}
            isExiting={exitingIds.has(notification.id)}
          />
        </div>
      ))}

      {/* Overflow Indicator */}
      {notifications.length > maxVisible && (
        <div className="glass-panel p-2 text-center pointer-events-auto">
          <p className="text-xs text-gray-600">
            +{notifications.length - maxVisible} more notifications
          </p>
        </div>
      )}
    </div>
  )
}

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    options?: {
      duration?: number
      action?: Notification['action']
    }
  ) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const notification: Notification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
      duration: options?.duration ?? (type === 'critical' ? 0 : 5000), // Critical persist, others 5s
      action: options?.action
    }

    setNotifications(prev => [notification, ...prev])
    return id
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Clinical-specific notification helpers
  const addCriticalAlert = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification('critical', title, message, { duration: 0, action })
  }, [addNotification])

  const addWarningAlert = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification('warning', title, message, { duration: 8000, action })
  }, [addNotification])

  const addSuccessAlert = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification('success', title, message, { duration: 3000, action })
  }, [addNotification])

  const addInfoAlert = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification('info', title, message, { duration: 5000, action })
  }, [addNotification])

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    addCriticalAlert,
    addWarningAlert,
    addSuccessAlert,
    addInfoAlert
  }
}

export default NotificationSystem