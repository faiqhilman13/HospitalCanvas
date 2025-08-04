// Core Types for AI-Powered Clinical Canvas

export interface Patient {
  id: string
  name: string
  age?: number
  gender?: 'male' | 'female' | 'other'
}

export interface PatientSummary {
  clinical_summary: string
  key_issues: string[]
  urgency_level: 'low' | 'medium' | 'high' | 'critical'
  confidence_score: number
}

export interface ClinicalDataPoint {
  date: string
  value: string
  unit: string
  reference_range?: string
  flag?: 'normal' | 'high' | 'low' | 'critical'
}

export interface VitalSign {
  name: string
  values: ClinicalDataPoint[]
}

export interface LabTest {
  name: string
  value: string
  unit: string
  reference_range: string
  flag: 'normal' | 'high' | 'low' | 'critical'
  date: string
}

export interface LabCategory {
  category: string
  tests: LabTest[]
}

export interface ClinicalData {
  vitals: VitalSign[]
  labs: LabCategory[]
}

export interface Document {
  id: string
  filename: string
  type: string
  url: string
  pages: number
}

export interface QAPair {
  id: string
  question: string
  answer: string
  confidence: number
  source: {
    document_id: string
    page: number
    text: string
  }
}

// Canvas Types
export interface CanvasPosition {
  x: number
  y: number
}

export interface CanvasSize {
  width: number
  height: number
}

export interface CanvasViewport {
  x: number
  y: number
  zoom: number
}

export type CanvasNodeType = 
  | 'PatientSummary'
  | 'VitalsChart'
  | 'DocumentViewer'
  | 'AIQuestionBox'
  | 'LabResults'
  | 'Timeline'

export interface CanvasNode {
  id: string
  type: CanvasNodeType
  position: CanvasPosition
  size: CanvasSize
  data: any // Node-specific data payload
}

export interface CanvasConnection {
  id: string
  source: string
  target: string
  type?: string
}

export interface CanvasLayout {
  viewport: CanvasViewport
  nodes: CanvasNode[]
  connections: CanvasConnection[]
}

export interface PatientData {
  patient: Patient
  summary: PatientSummary
  canvas_layout: CanvasLayout
  clinical_data: ClinicalData
  documents: Document[]
  qa_pairs: QAPair[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface PatientListResponse {
  patients: Array<{
    id: string
    name: string
    preview_summary: string
  }>
}

// Store Types
export interface CanvasStore {
  patientData: PatientData | null
  selectedPatientId: string | null
  viewport: CanvasViewport
  nodes: CanvasNode[]
  connections: CanvasConnection[]
  
  // Actions
  setPatientData: (data: PatientData) => void
  updateViewport: (viewport: Partial<CanvasViewport>) => void
  updateNodePosition: (nodeId: string, position: CanvasPosition) => void
  updateNodeSize: (nodeId: string, size: CanvasSize) => void
  addNode: (node: CanvasNode) => void
  removeNode: (nodeId: string) => void
  resetCanvas: () => void
}

// Component Props Types
export interface PatientSelectorProps {
  selectedPatientId: string
  onPatientSelect: (patientId: string) => void
}

export interface ClinicalCanvasProps {
  patientId: string
}

export interface CanvasNodeProps {
  id: string
  data: any
  isConnectable?: boolean
  selected?: boolean
}

export interface PatientSummaryNodeData {
  summary: PatientSummary
  patient: Patient
}

export interface VitalsChartNodeData {
  vitals: VitalSign[]
  title: string
}

export interface DocumentViewerNodeData {
  document: Document
  highlightedText?: string
  highlightedPage?: number
}

export interface AIQuestionBoxNodeData {
  qa_pairs: QAPair[]
  onAsk: (question: string) => Promise<QAPair>
}