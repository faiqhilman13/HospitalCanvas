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

// Clinical Questionnaire and Assessment Types
export interface SOCRATESAssessment {
  site: string
  onset: string
  character: string
  radiation: string
  associated_symptoms: string
  timing: string
  exacerbating_factors: string
  severity: number // 1-10 scale
}

export interface MedicationCompliance {
  medication_name: string
  prescribed_dose: string
  actual_compliance: 'compliant' | 'partial' | 'non-compliant'
  missed_doses_per_week: number
  side_effects: string[]
  patient_concerns: string
}

export interface LifestyleFactors {
  smoking_status: 'never' | 'former' | 'current'
  cigarettes_per_day?: number
  smoking_duration_years?: number
  diet_modifications: 'none' | 'attempted' | 'adherent'
  diet_description: string
  exercise_frequency: 'none' | 'rare' | 'weekly' | 'daily'
  exercise_type: string
  exercise_duration_minutes?: number
}

export interface SubjectiveTemplate {
  chief_complaint: string
  current_status: 'keeping_well' | 'has_complaint'
  socrates_assessment?: SOCRATESAssessment
  medication_compliance: MedicationCompliance[]
  symptom_review: {
    heart_failure_symptoms: boolean
    chest_pain: boolean
    shortness_of_breath: boolean
    palpitations: boolean
    dizziness: boolean
    nausea: boolean
    other_symptoms: string[]
  }
  lifestyle_factors: LifestyleFactors
  functional_status: string
  patient_concerns: string[]
}

export interface ExaminationPrompt {
  category: 'general' | 'cardiovascular' | 'respiratory' | 'abdominal' | 'neurological'
  prompt_text: string
  expected_findings: string[]
  abnormal_flags: string[]
  clinical_significance: string
}

export interface ObjectiveChecklist {
  general_appearance: {
    alert: boolean
    distressed: boolean
    comfortable: boolean
    color: 'pink' | 'pale' | 'cyanotic' | 'jaundiced'
  }
  vital_signs_assessment: {
    blood_pressure_interpretation: string
    heart_rate_assessment: string
    respiratory_rate_assessment: string
    temperature_significance: string
  }
  physical_examination: {
    cardiovascular: {
      heart_sounds: string
      murmurs: boolean
      jugular_venous_pressure: 'normal' | 'elevated'
      peripheral_edema: boolean
      pulse_character: string
    }
    respiratory: {
      breathing_pattern: string
      chest_expansion: string
      breath_sounds: string
      adventitious_sounds: string[]
    }
    abdominal: {
      inspection: string
      palpation: string
      bowel_sounds: string
      organomegaly: boolean
    }
  }
  clinical_signs: {
    hydration_status: 'well_hydrated' | 'dehydrated' | 'overloaded'
    perfusion: 'good' | 'poor'
    respiratory_distress: boolean
  }
}

export interface ClinicalReviewTemplate {
  patient_demographics: {
    age: number
    gender: 'male' | 'female' | 'other'
    living_situation: string
    occupation_status: 'working' | 'retired' | 'disabled' | 'unemployed'
    activities_of_daily_living: 'independent' | 'assisted' | 'dependent'
  }
  underlying_conditions: string[]
  visit_type: 'routine_follow_up' | 'urgent' | 'new_complaint' | 'medication_review'
  investigations_planned: {
    laboratory: string[]
    imaging: string[]
    specialist_referrals: string[]
  }
  follow_up_plan: {
    next_visit_timing: string
    monitoring_parameters: string[]
    patient_education_topics: string[]
    lifestyle_modifications: string[]
  }
}

export interface ClinicalQuestionnaire {
  template_type: 'general' | 'diabetes' | 'cardiovascular' | 'kidney_disease'
  subjective_template: SubjectiveTemplate
  objective_checklist: ObjectiveChecklist
  clinical_review: ClinicalReviewTemplate
  completion_status: {
    subjective_complete: boolean
    objective_complete: boolean
    assessment_complete: boolean
    plan_complete: boolean
  }
}

// Enhanced SOAP Section with Clinical Structure
export interface SOAPSection {
  subjective: {
    template_data: SubjectiveTemplate
    narrative_summary: string
    clinical_interview_notes: string
  }
  objective: {
    examination_checklist: ObjectiveChecklist
    examination_prompts: ExaminationPrompt[]
    clinical_findings_summary: string
  }
  assessment: {
    primary_diagnosis: string
    differential_diagnoses: string[]
    laboratory_interpretation: string
    clinical_reasoning: string
    risk_stratification: string
  }
  plan: {
    immediate_management: string[]
    medications: {
      continue: string[]
      modify: string[]
      discontinue: string[]
      new: string[]
    }
    investigations: {
      laboratory: string[]
      imaging: string[]
      monitoring: string[]
    }
    follow_up: {
      timing: string
      provider: string
      specific_instructions: string[]
    }
    patient_education: string[]
    lifestyle_recommendations: string[]
  }
}

export interface SOAPNote {
  id: string
  patient_id: string
  date: string
  soap_sections: SOAPSection
  generated_by: 'ai' | 'manual'
  confidence_score: number
  last_modified: string
  template_used: string
  clinical_questionnaire?: ClinicalQuestionnaire
}

// Phase 4: Clinical Decision Support Types
export interface SmartExaminationHint {
  id: string
  category: 'general' | 'cardiovascular' | 'respiratory' | 'abdominal' | 'neurological' | 'endocrine'
  condition_specific: string[] // e.g., ['diabetes', 'kidney_disease', 'hypertension']
  priority: 'high' | 'medium' | 'low'
  prompt_text: string
  clinical_rationale: string
  abnormal_findings_guidance: string[]
  follow_up_required: boolean
  risk_factors_addressed: string[]
}

export interface MedicationReview {
  medication_id: string
  medication_name: string
  current_dose: string
  prescribed_dose: string
  compliance_status: 'compliant' | 'partial' | 'non_compliant' | 'unknown'
  last_taken: string
  missed_doses_weekly: number
  side_effects_reported: string[]
  effectiveness_rating: number // 1-5 scale
  patient_satisfaction: number // 1-5 scale
  requires_adjustment: boolean
  clinical_notes: string
}

export interface RiskFactorAssessment {
  assessment_id: string
  category: 'smoking' | 'diet' | 'exercise' | 'monitoring' | 'compliance'
  current_status: string
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
  improvement_opportunities: string[]
  specific_recommendations: string[]
  monitoring_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  target_goals: string[]
  progress_indicators: string[]
}

export interface ClinicalDecisionSupport {
  smart_examination_hints: SmartExaminationHint[]
  medication_reviews: MedicationReview[]
  risk_factor_assessments: RiskFactorAssessment[]
  generated_recommendations: string[]
  confidence_score: number
  last_updated: string
}

export interface SOAPGeneratorNodeData {
  patient: Patient
  clinical_data: ClinicalData
  onGenerate: (patientId: string, questionnaire?: ClinicalQuestionnaire) => Promise<SOAPNote>
  onSave: (soapNote: SOAPNote) => Promise<void>
  existingNotes?: SOAPNote[]
  availableTemplates?: {
    id: string
    name: string
    type: 'general' | 'diabetes' | 'cardiovascular' | 'kidney_disease'
    description: string
  }[]
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