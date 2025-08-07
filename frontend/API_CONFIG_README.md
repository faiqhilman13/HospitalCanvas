# API Configuration for AI-Powered Clinical Canvas

This document explains the API configuration setup for the frontend React application.

## Files Created

### 1. Environment Files

- **`.env.development`** - Development environment configuration
- **`.env.production`** - Production environment configuration for Railway deployment

### 2. API Configuration Module

- **`src/config/api.ts`** - Centralized API configuration with:
  - Environment-based URL selection
  - Request/response interceptors
  - Error handling and retry logic
  - Timeout and caching configuration
  - Mock data fallback support

### 3. Updated Hooks

- **`src/hooks/usePatients.ts`** - Updated to use new API client
- **`src/hooks/usePatientData.ts`** - Enhanced with error handling
- **`src/hooks/useSOAPNotes.ts`** - Integrated with production-ready API calls

### 4. Enhanced Components

- **`src/main.tsx`** - Global QueryClient configuration
- **`src/components/CanvasPage.tsx`** - Removed duplicate QueryClient
- **`src/components/HealthCheck.tsx`** - New component for API health monitoring

## Environment Variables

### Development (.env.development)
```env
VITE_API_URL=http://localhost:8000/api
VITE_ENABLE_MOCK_DATA_FALLBACK=true
VITE_ENABLE_API_LOGGING=true
VITE_DEBUG_MODE=true
```

### Production (.env.production)
```env
VITE_API_URL=https://your-backend-app.up.railway.app/api
VITE_ENABLE_MOCK_DATA_FALLBACK=true
VITE_ENABLE_API_LOGGING=false
VITE_DEBUG_MODE=false
```

## Railway Deployment Setup

1. **Update the production URL**:
   ```bash
   # In .env.production, replace with your actual Railway URL
   VITE_API_URL=https://your-actual-app-name.up.railway.app/api
   ```

2. **Build for production**:
   ```bash
   npm run build
   ```

3. **Deploy to Netlify** (or your preferred platform):
   - The build process automatically uses `.env.production`
   - Vite includes the environment variables at build time

## Features

### Error Handling
- Automatic retry with exponential backoff
- Graceful fallback to mock data when API is unavailable
- Comprehensive error logging and reporting
- Network timeout protection

### Performance
- Configurable cache TTL for different data types
- Optimized retry strategies
- Request deduplication via React Query
- Memory management with garbage collection

### Development Experience
- Health check component for API status monitoring
- Detailed logging in development mode
- Mock data fallback for offline development
- TypeScript support with comprehensive types

## API Client Usage

### Basic Usage
```typescript
import { apiClient } from '../config/api'

// GET request
const result = await apiClient.get<Patient[]>('/patients')
if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error.message)
}

// POST request
const result = await apiClient.post<SOAPNote>(
  '/patients/123/soap/generate',
  { patientId: '123' }
)
```

### React Query Integration
```typescript
import { useQuery } from '@tanstack/react-query'
import { apiClient, getCacheConfig } from '../config/api'

export function usePatients() {
  const cacheConfig = getCacheConfig()
  
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const result = await apiClient.get<Patient[]>('/patients')
      if (result.success) return result.data
      throw new Error(result.error?.message || 'Failed to fetch')
    },
    staleTime: cacheConfig.patientsListTTL,
    retry: (failureCount, error) => failureCount < 3
  })
}
```

### Health Check Component
```typescript
import { HealthCheck } from '../components/HealthCheck'

function Header() {
  return (
    <div className="header">
      <h1>Clinical Canvas</h1>
      <HealthCheck />
    </div>
  )
}
```

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000/api` | Backend API base URL |
| `VITE_API_TIMEOUT` | `30000` | Request timeout in milliseconds |
| `VITE_API_RETRY_ATTEMPTS` | `3` | Number of retry attempts |
| `VITE_API_RETRY_DELAY` | `1000` | Base retry delay in milliseconds |
| `VITE_ENABLE_MOCK_DATA_FALLBACK` | `true` | Enable fallback to mock data |
| `VITE_ENABLE_API_LOGGING` | `false` | Enable detailed API logging |
| `VITE_ENABLE_ERROR_REPORTING` | `true` | Enable error reporting |
| `VITE_CACHE_PATIENT_DATA_TTL` | `300000` | Patient data cache TTL (5 min) |
| `VITE_CACHE_PATIENTS_LIST_TTL` | `600000` | Patients list cache TTL (10 min) |
| `VITE_CACHE_SOAP_NOTES_TTL` | `120000` | SOAP notes cache TTL (2 min) |

## Production Checklist

- [ ] Update `VITE_API_URL` in `.env.production` with actual Railway URL
- [ ] Set `VITE_ENABLE_API_LOGGING=false` in production
- [ ] Set `VITE_DEBUG_MODE=false` in production
- [ ] Configure appropriate cache TTL values for production load
- [ ] Test API connectivity with the HealthCheck component
- [ ] Verify mock data fallback works when API is temporarily unavailable
- [ ] Monitor error logs for production issues

## Troubleshooting

### API Connection Issues
1. Check the HealthCheck component status
2. Verify the API URL in environment variables
3. Check browser network tab for failed requests
4. Review console logs for detailed error information

### Mock Data Fallback
- When `VITE_ENABLE_MOCK_DATA_FALLBACK=true`, the app will use mock data if the API is unavailable
- This ensures the app remains functional during API downtime
- Monitor logs to identify when fallback is being used

### Cache Issues
- Clear browser cache if data seems stale
- Adjust cache TTL values in environment variables
- Use React Query DevTools in development to inspect cache state