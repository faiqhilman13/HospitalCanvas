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
  | 'patientSummary'
  | 'vitalsChart'
  | 'documentViewer'
  | 'aiQuestionBox'
  | 'labResults'
  | 'Timeline'
  | 'SOAPGenerator'
  | 'analyticsReport'
  | 'systemAdmin'

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

// Enhanced API Error Types
export interface ApiError {
  status?: number
  statusText?: string
  message: string
  code?: string
  details?: any
  timestamp: Date
}

// API Configuration Types
export interface ApiConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  enableMockFallback: boolean
  enableLogging: boolean
  enableErrorReporting: boolean
}

// Loading State Helper Type
export interface LoadingState {
  isLoading: boolean
  isError: boolean
  error: string | null
  hasData: boolean
  isEmpty: boolean
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
  currentRole: UserRole
  viewport: CanvasViewport
  nodes: CanvasNode[]
  connections: CanvasConnection[]
  
  // Actions
  setPatientData: (data: PatientData) => void
  setCurrentRole: (role: UserRole) => void
  loadRoleBasedLayout: (patientId: string, role: UserRole) => Promise<void>
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
  visitHistory?: VisitSummary[]
  criticalAlerts?: CriticalAlert[]
  trendAnalysis?: TrendAnalysis
}

export interface VisitSummary {
  date: string
  type: 'routine' | 'urgent' | 'follow-up' | 'emergency'
  summary: string
  key_changes: string[]
}

export interface CriticalAlert {
  id: string
  type: 'lab' | 'vital' | 'medication' | 'clinical'
  message: string
  severity: 'warning' | 'critical'
  date: string
  resolved: boolean
}

export interface TrendAnalysis {
  improving: string[]
  declining: string[]
  stable: string[]
  confidence: number
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

export interface SOAPSection {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

export interface SOAPNote {
  id: string
  patient_id: string
  date: string
  soap_sections: SOAPSection
  generated_by: 'ai' | 'manual'
  confidence_score: number
  last_modified: string
}

export interface SOAPGeneratorNodeData {
  patient: Patient
  clinical_data: ClinicalData
  onGenerate: (patientId: string) => Promise<SOAPNote>
  onSave: (soapNote: SOAPNote) => Promise<void>
  existingNotes?: SOAPNote[]
}

export interface TimelineEvent {
  id: string
  date: string
  type: 'visit' | 'lab' | 'vital' | 'document' | 'procedure' | 'medication'
  title: string
  description: string
  details?: any
  urgency?: 'low' | 'medium' | 'high' | 'critical'
}

export interface PatientTimelineNodeData {
  events: TimelineEvent[]
  patient: Patient
  dateRange?: {
    start: string
    end: string
  }
}

// Role-Based Access Control Types
export type UserRole = 'clinician' | 'analyst' | 'admin'

export interface RoleInfo {
  id: UserRole
  name: string
  description: string
  icon: string
}

export interface PopulationMetric {
  metric_name: string
  value: number
  trend_direction: 'up' | 'down' | 'stable'
  change_percentage: number
  period: string
}

export interface DiseasePattern {
  pattern_name: string
  confidence_score: number
  affected_patients: number
  key_indicators: string[]
  trend_data: Array<{
    date: string
    prevalence: number
  }>
}

export interface MedicationAnalytic {
  medication_name: string
  usage_count: number
  effectiveness_score: number
  side_effects_reported: number
  cost_analysis: {
    average_cost: number
    total_prescribed: number
  }
}

export interface AnalyticsData {
  population_metrics: PopulationMetric[]
  disease_patterns: DiseasePattern[]
  medications: MedicationAnalytic[]
}

export interface AnalyticsReportNodeData {
  title: string
  data: AnalyticsData
  role: UserRole
}

export interface SystemAdminNodeData {
  system_metrics: {
    active_users: number
    total_patients: number
    documents_processed: number
    uptime_percentage: number
  },
  recent_activity: Array<{
    timestamp: string
    user: string
    action: string
    resource: string
  }>
}