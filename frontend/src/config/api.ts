/**
 * API Configuration Management for AI-Powered Clinical Canvas
 * Handles environment-based URL selection, error handling, and request/response interceptors
 */

// Environment-based configuration
export interface ApiConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  enableMockFallback: boolean
  enableLogging: boolean
  enableErrorReporting: boolean
}

// Error types for better error handling
export interface ApiError {
  status?: number
  statusText?: string
  message: string
  code?: string
  details?: any
  timestamp: Date
}

export class ApiClient {
  private config: ApiConfig

  constructor() {
    this.config = {
      baseUrl: this.getApiUrl(),
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000'),
      enableMockFallback: import.meta.env.VITE_ENABLE_MOCK_DATA_FALLBACK === 'true',
      enableLogging: import.meta.env.VITE_ENABLE_API_LOGGING === 'true',
      enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true'
    }

    if (this.config.enableLogging) {
      console.log('API Client initialized with config:', this.config)
    }
  }

  private getApiUrl(): string {
    // Environment-based URL selection
    const envUrl = import.meta.env.VITE_API_URL
    
    if (envUrl) {
      return envUrl
    }

    // Fallback based on environment
    if (import.meta.env.PROD) {
      return 'https://hospitalcanvas-production.up.railway.app/api'
    }

    // Development fallback
    return 'http://localhost:8000/api'
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private createApiError(
    message: string, 
    status?: number, 
    statusText?: string, 
    details?: any
  ): ApiError {
    return {
      status,
      statusText,
      message,
      details,
      timestamp: new Date()
    }
  }

  private logError(error: ApiError): void {
    if (this.config.enableLogging) {
      console.error('API Error:', error)
    }

    if (this.config.enableErrorReporting) {
      // In a real application, you would send this to an error reporting service
      // like Sentry, LogRocket, or custom analytics
      console.info('Error reported for monitoring:', {
        message: error.message,
        status: error.status,
        timestamp: error.timestamp
      })
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        }
      })
      
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        if (this.config.enableLogging && attempt > 1) {
          console.log(`API retry attempt ${attempt} for ${url}`)
        }

        const response = await this.fetchWithTimeout(url, options)

        // Don't retry on 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500) {
          return response
        }

        // Retry on 5xx errors and network issues
        if (response.ok || attempt === this.config.retryAttempts) {
          return response
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * attempt) // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Max retry attempts exceeded')
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ data: T; success: boolean; error?: ApiError }> {
    const url = `${this.config.baseUrl}${endpoint}`

    try {
      if (this.config.enableLogging) {
        console.log(`API Request: ${options.method || 'GET'} ${url}`)
      }

      const response = await this.fetchWithRetry(url, options)

      if (!response.ok) {
        const errorMessage = `API Error: ${response.status} ${response.statusText}`
        const apiError = this.createApiError(
          errorMessage,
          response.status,
          response.statusText,
          { url, method: options.method || 'GET' }
        )

        this.logError(apiError)

        return {
          data: null as unknown as T,
          success: false,
          error: apiError
        }
      }

      const data: T = await response.json()

      if (this.config.enableLogging) {
        console.log(`API Response: ${response.status} for ${url}`)
      }

      return {
        data,
        success: true
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown API error'
      const apiError = this.createApiError(
        errorMessage,
        undefined,
        undefined,
        { url, method: options.method || 'GET', originalError: error }
      )

      this.logError(apiError)

      return {
        data: null as unknown as T,
        success: false,
        error: apiError
      }
    }
  }

  // Convenience methods for common HTTP verbs
  async get<T>(endpoint: string): Promise<{ data: T; success: boolean; error?: ApiError }> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any): Promise<{ data: T; success: boolean; error?: ApiError }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  async put<T>(endpoint: string, body?: any): Promise<{ data: T; success: boolean; error?: ApiError }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<{ data: T; success: boolean; error?: ApiError }> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Health check endpoint
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.config.baseUrl}/health`, {
        method: 'GET'
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Get current configuration
  getConfig(): ApiConfig {
    return { ...this.config }
  }

  // Update configuration at runtime
  updateConfig(updates: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...updates }
    
    if (this.config.enableLogging) {
      console.log('API config updated:', updates)
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Default export for backwards compatibility
export default apiClient

// React Query error handler
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ApiError).message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

// Loading state helper for React Query
export const createLoadingState = (isLoading: boolean, error: unknown, data: unknown) => ({
  isLoading,
  isError: !!error,
  error: error ? handleApiError(error) : null,
  hasData: !!data,
  isEmpty: !data && !isLoading && !error
})

// Cache configuration helpers
export const getCacheConfig = () => ({
  patientDataTTL: parseInt(import.meta.env.VITE_CACHE_PATIENT_DATA_TTL || '300000'), // 5 minutes
  patientsListTTL: parseInt(import.meta.env.VITE_CACHE_PATIENTS_LIST_TTL || '600000'), // 10 minutes
  soapNotesTTL: parseInt(import.meta.env.VITE_CACHE_SOAP_NOTES_TTL || '120000'), // 2 minutes
})

// Environment helpers
export const isProduction = () => import.meta.env.PROD
export const isDevelopment = () => import.meta.env.DEV
export const getEnvironment = () => import.meta.env.VITE_NODE_ENV || import.meta.env.MODE

// API endpoint constants
export const API_ENDPOINTS = {
  PATIENTS: '/patients',
  PATIENT_DATA: (id: string) => `/patients/${id}`,
  PATIENT_ROLE_DATA: (id: string, role: string) => `/patients/${id}?role=${role}`,
  SOAP_GENERATE: (id: string) => `/patients/${id}/soap/generate`,
  SOAP_SAVE: (id: string) => `/patients/${id}/soap/save`,
  SOAP_NOTES: (id: string) => `/patients/${id}/soap`,
  HEALTH: '/health'
} as const