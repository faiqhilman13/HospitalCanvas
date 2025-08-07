import { useQuery } from '@tanstack/react-query'
import { apiClient, isProduction, getEnvironment } from '../config/api'

// Health check component to verify API connectivity
export function HealthCheck() {
  const { data: isHealthy, error, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1, // Only retry once for health checks
  })

  const config = apiClient.getConfig()
  const environment = getEnvironment()

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <span>Checking API...</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        isHealthy 
          ? 'bg-green-400' 
          : 'bg-red-400'
      }`}></div>
      <span className={isHealthy ? 'text-green-600' : 'text-red-600'}>
        API {isHealthy ? 'Connected' : 'Disconnected'}
      </span>
      {!isProduction() && (
        <span className="text-xs text-gray-400 ml-2">
          ({environment} - {config.enableMockFallback ? 'with fallback' : 'no fallback'})
        </span>
      )}
    </div>
  )
}

// Connection status hook for programmatic use
export function useApiHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}