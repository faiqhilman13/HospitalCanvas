import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { apiClient } from './config/api'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes default
      refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
      retry: (failureCount, error) => {
        // Global retry logic
        const config = apiClient.getConfig()
        
        // Don't retry if we have mock fallback enabled and this is not the first attempt
        if (config.enableMockFallback && failureCount > 1) {
          return false
        }
        
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
    },
    mutations: {
      retry: 1, // Retry mutations once by default
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
