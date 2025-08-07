import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { apiClient } from '../config/api'
import type { 
  CanvasStore, 
  PatientData, 
  CanvasViewport, 
  CanvasNode, 
  CanvasPosition, 
  CanvasSize,
  UserRole 
} from '../types'

const initialViewport: CanvasViewport = {
  x: 0,
  y: 0,
  zoom: 1
}

export const useCanvasStore = create<CanvasStore>()(
  devtools(
    (set, get) => ({
      // State
      patientData: null,
      selectedPatientId: null,
      currentRole: 'clinician' as UserRole,
      viewport: initialViewport,
      nodes: [],
      connections: [],

      // Actions
      setPatientData: (data: PatientData) => {
        set({
          patientData: data,
          selectedPatientId: data.patient.id,
          viewport: data.canvas_layout.viewport,
          nodes: data.canvas_layout.nodes,
          connections: data.canvas_layout.connections,
        })
      },

      setCurrentRole: (role: UserRole) => {
        set({ currentRole: role })
        // Reload canvas layout for new role if patient is selected
        const state = get()
        if (state.selectedPatientId) {
          state.loadRoleBasedLayout(state.selectedPatientId, role)
        }
      },

      loadRoleBasedLayout: async (patientId: string, role: UserRole) => {
        try {
          const result = await apiClient.get(`/patients/${patientId}?role=${role}`)
          if (result.success && result.data) {
            const data = result.data
            set({
              patientData: data,
              viewport: data.canvas_layout.viewport,
              nodes: data.canvas_layout.nodes,
              connections: data.canvas_layout.connections,
            })
          } else {
            console.error('Failed to load role-based layout:', result.error?.message)
          }
        } catch (error) {
          console.error('Failed to load role-based layout:', error)
        }
      },

      updateViewport: (newViewport: Partial<CanvasViewport>) => {
        set((state) => ({
          viewport: { ...state.viewport, ...newViewport }
        }))
      },

      updateNodePosition: (nodeId: string, position: CanvasPosition) => {
        set((state) => ({
          nodes: state.nodes.map(node =>
            node.id === nodeId ? { ...node, position } : node
          )
        }))
      },

      updateNodeSize: (nodeId: string, size: CanvasSize) => {
        set((state) => ({
          nodes: state.nodes.map(node =>
            node.id === nodeId ? { ...node, size } : node
          )
        }))
      },

      addNode: (node: CanvasNode) => {
        set((state) => ({
          nodes: [...state.nodes, node]
        }))
      },

      removeNode: (nodeId: string) => {
        set((state) => ({
          nodes: state.nodes.filter(node => node.id !== nodeId),
          connections: state.connections.filter(
            conn => conn.source !== nodeId && conn.target !== nodeId
          )
        }))
      },

      resetCanvas: () => {
        set({
          patientData: null,
          selectedPatientId: null,
          viewport: initialViewport,
          nodes: [],
          connections: [],
        })
      },
    }),
    {
      name: 'clinical-canvas-store',
    }
  )
)