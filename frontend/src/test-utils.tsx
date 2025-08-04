import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactFlowProvider } from '@xyflow/react'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ReactFlowProvider>
        {children}
      </ReactFlowProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test utilities for canvas components
export const createMockNodeProps = (overrides: any = {}) => ({
  id: 'test-node-1',
  data: {},
  isConnectable: true,
  selected: false,
  ...overrides,
})

// Mock canvas store
export const mockCanvasStore = {
  patientData: null,
  selectedPatientId: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  nodes: [],
  connections: [],
  setPatientData: vi.fn(),
  updateViewport: vi.fn(),
  updateNodePosition: vi.fn(),
  updateNodeSize: vi.fn(),
  addNode: vi.fn(),
  removeNode: vi.fn(),
  resetCanvas: vi.fn(),
}