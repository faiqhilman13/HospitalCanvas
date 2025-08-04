import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  CanvasStore, 
  PatientData, 
  CanvasViewport, 
  CanvasNode, 
  CanvasPosition, 
  CanvasSize 
} from '../types'

const initialViewport: CanvasViewport = {
  x: 0,
  y: 0,
  zoom: 1
}

export const useCanvasStore = create<CanvasStore>()(
  devtools(
    (set) => ({
      // State
      patientData: null,
      selectedPatientId: null,
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