import React, { useState, useCallback, useMemo } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import { 
  FileText, 
  Sparkles, 
  Save, 
  Edit3, 
  Calendar, 
  User, 
  ClipboardList, 
  Stethoscope,
  Brain,
  Pill,
  Target
} from 'lucide-react'
import type { 
  CanvasNodeProps, 
  SOAPGeneratorNodeData, 
  SOAPNote, 
  SOAPSection, 
  ClinicalQuestionnaire,
  SubjectiveTemplate,
  ObjectiveChecklist,
  ClinicalReviewTemplate,
  MedicationCompliance,
  LifestyleFactors
} from '../../types'
import { createSOAPNoteHandlers } from '../../hooks/useSOAPNotes'
import ClinicalQuestionnairePanel from '../ClinicalQuestionnairePanel'
import SmartExaminationPrompts from '../SmartExaminationPrompts'
import MedicationComplianceTracker from '../MedicationComplianceTracker'
import RiskFactorAssessment from '../RiskFactorAssessment'

const SOAPGeneratorNode: React.FC<CanvasNodeProps> = ({ data }) => {
  const nodeData = data as SOAPGeneratorNodeData
  const { patient, clinical_data } = nodeData
  
  // Add null safety check for patient data
  if (!patient) {
    return (
      <div className="canvas-node min-w-[400px] max-w-[500px]">
        <Handle type="target" position={Position.Top} />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900">SOAP Note Generator</h3>
              <p className="text-sm text-gray-500">Patient data not available</p>
            </div>
          </div>
        </div>

        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm mb-2">Patient data not available for this role</p>
          <p className="text-xs text-gray-400">
            SOAP note generation requires patient context
          </p>
        </div>

        <Handle type="source" position={Position.Bottom} />
      </div>
    )
  }
  
  // Use the SOAP note hooks
  const {
    onGenerate,
    onSave,
    existingNotes = [],
    isGenerating,
    isSaving
  } = createSOAPNoteHandlers(patient.id)
  
  const [currentNote, setCurrentNote] = useState<SOAPNote | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [viewMode, setViewMode] = useState<'questionnaire' | 'soap' | 'examination' | 'medication' | 'risk_factors'>('questionnaire')
  const [clinicalQuestionnaire, setClinicalQuestionnaire] = useState<ClinicalQuestionnaire>(() => {
    // Initialize with default clinical questionnaire based on patient condition
    const templateType = determineTemplateType(patient, clinical_data)
    
    return {
      template_type: templateType,
      subjective_template: createDefaultSubjectiveTemplate(patient),
      objective_checklist: createDefaultObjectiveChecklist(),
      clinical_review: createDefaultClinicalReview(patient),
      completion_status: {
        subjective_complete: false,
        objective_complete: false,
        assessment_complete: false,
        plan_complete: false
      }
    }
  })
  
  // Legacy state for traditional view
  const [editedSections, setEditedSections] = useState<SOAPSection>({
    subjective: {
      template_data: clinicalQuestionnaire.subjective_template,
      narrative_summary: '',
      clinical_interview_notes: ''
    },
    objective: {
      examination_checklist: clinicalQuestionnaire.objective_checklist,
      examination_prompts: [],
      clinical_findings_summary: ''
    },
    assessment: {
      primary_diagnosis: '',
      differential_diagnoses: [],
      laboratory_interpretation: '',
      clinical_reasoning: '',
      risk_stratification: ''
    },
    plan: {
      immediate_management: [],
      medications: {
        continue: [],
        modify: [],
        discontinue: [],
        new: []
      },
      investigations: {
        laboratory: [],
        imaging: [],
        monitoring: []
      },
      follow_up: {
        timing: '',
        provider: '',
        specific_instructions: []
      },
      patient_education: [],
      lifestyle_recommendations: []
    }
  })

  // Helper functions to create default templates
  function determineTemplateType(patient: any, clinical_data: any): 'general' | 'diabetes' | 'cardiovascular' | 'kidney_disease' {
    // Simple logic to determine template type based on patient data
    // In a real system, this would be more sophisticated
    const summary = clinical_data?.summary?.clinical_summary?.toLowerCase() || ''
    
    if (summary.includes('diabetes') || summary.includes('glucose')) return 'diabetes'
    if (summary.includes('kidney') || summary.includes('creatinine')) return 'kidney_disease'
    if (summary.includes('heart') || summary.includes('cardiovascular')) return 'cardiovascular'
    
    return 'general'
  }

  function createDefaultSubjectiveTemplate(patient: any): SubjectiveTemplate {
    return {
      chief_complaint: '',
      current_status: 'keeping_well',
      medication_compliance: [],
      symptom_review: {
        heart_failure_symptoms: false,
        chest_pain: false,
        shortness_of_breath: false,
        palpitations: false,
        dizziness: false,
        nausea: false,
        other_symptoms: []
      },
      lifestyle_factors: {
        smoking_status: 'never',
        diet_modifications: 'none',
        diet_description: '',
        exercise_frequency: 'none',
        exercise_type: ''
      },
      functional_status: '',
      patient_concerns: []
    }
  }

  function createDefaultObjectiveChecklist(): ObjectiveChecklist {
    return {
      general_appearance: {
        alert: true,
        distressed: false,
        comfortable: true,
        color: 'pink'
      },
      vital_signs_assessment: {
        blood_pressure_interpretation: '',
        heart_rate_assessment: '',
        respiratory_rate_assessment: '',
        temperature_significance: ''
      },
      physical_examination: {
        cardiovascular: {
          heart_sounds: '',
          murmurs: false,
          jugular_venous_pressure: 'normal',
          peripheral_edema: false,
          pulse_character: ''
        },
        respiratory: {
          breathing_pattern: '',
          chest_expansion: '',
          breath_sounds: '',
          adventitious_sounds: []
        },
        abdominal: {
          inspection: '',
          palpation: '',
          bowel_sounds: '',
          organomegaly: false
        }
      },
      clinical_signs: {
        hydration_status: 'well_hydrated',
        perfusion: 'good',
        respiratory_distress: false
      }
    }
  }

  function createDefaultClinicalReview(patient: any): ClinicalReviewTemplate {
    return {
      patient_demographics: {
        age: patient.age || 0,
        gender: patient.gender || 'other',
        living_situation: '',
        occupation_status: 'retired',
        activities_of_daily_living: 'independent'
      },
      underlying_conditions: [],
      visit_type: 'routine_follow_up',
      investigations_planned: {
        laboratory: ['FBS', 'HbA1c', 'Creat', 'TC', 'LDL', 'UFEME'],
        imaging: [],
        specialist_referrals: []
      },
      follow_up_plan: {
        next_visit_timing: '6 months',
        monitoring_parameters: [],
        patient_education_topics: [],
        lifestyle_modifications: []
      }
    }
  }

  const handleGenerate = useCallback(async () => {
    try {
      // Generate SOAP note using clinical questionnaire data
      const generatedNote = await onGenerate(patient.id, clinicalQuestionnaire)
      setCurrentNote(generatedNote)
      
      // Update edited sections with generated content
      setEditedSections(generatedNote.soap_sections)
      setIsEditing(false)
      
      // Switch to SOAP view to show generated content
      setViewMode('soap')
    } catch (error) {
      console.error('Failed to generate SOAP note:', error)
    }
  }, [patient.id, onGenerate, clinicalQuestionnaire])

  const handleSave = useCallback(async () => {
    if (!currentNote) return
    
    const updatedNote: SOAPNote = {
      ...currentNote,
      soap_sections: editedSections,
      last_modified: new Date().toISOString(),
      generated_by: isEditing ? 'manual' : currentNote.generated_by,
      template_used: clinicalQuestionnaire.template_type,
      clinical_questionnaire: clinicalQuestionnaire
    }
    
    try {
      await onSave(updatedNote)
      setCurrentNote(updatedNote)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save SOAP note:', error)
    }
  }, [currentNote, editedSections, isEditing, onSave, clinicalQuestionnaire])

  const handleQuestionnaireUpdate = useCallback((updatedQuestionnaire: ClinicalQuestionnaire) => {
    setClinicalQuestionnaire(updatedQuestionnaire)
    
    // Update the SOAP sections to reflect questionnaire changes
    setEditedSections(prev => ({
      ...prev,
      subjective: {
        ...prev.subjective,
        template_data: updatedQuestionnaire.subjective_template
      },
      objective: {
        ...prev.objective,
        examination_checklist: updatedQuestionnaire.objective_checklist
      }
    }))
  }, [])

  // Phase 4 handlers
  const handleExaminationHintApplied = useCallback((hintId: string, findings: string) => {
    setEditedSections(prev => ({
      ...prev,
      objective: {
        ...prev.objective,
        clinical_findings_summary: prev.objective.clinical_findings_summary + 
          (prev.objective.clinical_findings_summary ? '\n\n' : '') +
          `${hintId}: ${findings}`
      }
    }))
  }, [])

  const handleComplianceUpdate = useCallback((medicationId: string, compliance: MedicationCompliance) => {
    // Update the questionnaire with new compliance data
    setClinicalQuestionnaire(prev => ({
      ...prev,
      subjective_template: {
        ...prev.subjective_template,
        medication_compliance: prev.subjective_template.medication_compliance.map((med, index) => 
          `med-${index}` === medicationId ? compliance : med
        )
      }
    }))
  }, [])

  const handleRiskFactorUpdate = useCallback((assessmentId: string, assessment: any) => {
    // Update plan section with risk factor interventions
    setEditedSections(prev => ({
      ...prev,
      plan: {
        ...prev.plan,
        lifestyle_recommendations: [
          ...prev.plan.lifestyle_recommendations.filter(rec => !rec.includes(assessmentId)),
          ...assessment.specific_recommendations.map((rec: string) => `${assessmentId}: ${rec}`)
        ]
      }
    }))
  }, [])

  const handleSectionEdit = useCallback((section: keyof SOAPSection, value: any) => {
    setEditedSections(prev => ({
      ...prev,
      [section]: typeof value === 'string' ? value : { ...prev[section], ...value }
    }))
  }, [])

  // Calculate completion status
  const completionStatus = useMemo(() => {
    const subjectiveComplete = !!(
      clinicalQuestionnaire.subjective_template.chief_complaint ||
      clinicalQuestionnaire.subjective_template.current_status === 'keeping_well'
    )
    
    const medicationComplete = clinicalQuestionnaire.subjective_template.medication_compliance.length > 0
    
    const lifestyleComplete = (
      clinicalQuestionnaire.subjective_template.lifestyle_factors.smoking_status !== 'never' ||
      clinicalQuestionnaire.subjective_template.lifestyle_factors.exercise_frequency !== 'none' ||
      clinicalQuestionnaire.subjective_template.lifestyle_factors.diet_modifications !== 'none'
    )
    
    return {
      subjective_complete: subjectiveComplete && (medicationComplete || lifestyleComplete),
      objective_complete: true, // Objective is guidance-based, always considered "complete"
      assessment_complete: !!currentNote,
      plan_complete: !!currentNote
    }
  }, [clinicalQuestionnaire, currentNote])

  // Update questionnaire completion status
  React.useEffect(() => {
    setClinicalQuestionnaire(prev => ({
      ...prev,
      completion_status: completionStatus
    }))
  }, [completionStatus])

  // Rendering helpers for different view modes
  const renderViewModeSelector = () => (
    <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-4 flex-wrap gap-1">
      <button
        onClick={() => setViewMode('questionnaire')}
        className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs transition-colors ${
          viewMode === 'questionnaire'
            ? 'bg-clinical-blue text-white'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <ClipboardList className="w-3 h-3" />
        <span>Interview</span>
        <div className={`w-2 h-2 rounded-full ${
          completionStatus.subjective_complete ? 'bg-green-400' : 'bg-gray-400'
        }`} />
      </button>
      
      <button
        onClick={() => setViewMode('examination')}
        className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs transition-colors ${
          viewMode === 'examination'
            ? 'bg-clinical-blue text-white'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Brain className="w-3 h-3" />
        <span>Exam Hints</span>
      </button>

      <button
        onClick={() => setViewMode('medication')}
        className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs transition-colors ${
          viewMode === 'medication'
            ? 'bg-clinical-blue text-white'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Pill className="w-3 h-3" />
        <span>Medications</span>
      </button>

      <button
        onClick={() => setViewMode('risk_factors')}
        className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs transition-colors ${
          viewMode === 'risk_factors'
            ? 'bg-clinical-blue text-white'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Target className="w-3 h-3" />
        <span>Risk Factors</span>
      </button>
      
      <button
        onClick={() => setViewMode('soap')}
        className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs transition-colors ${
          viewMode === 'soap'
            ? 'bg-clinical-blue text-white'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <FileText className="w-3 h-3" />
        <span>SOAP Note</span>
        <div className={`w-2 h-2 rounded-full ${
          currentNote ? 'bg-green-400' : 'bg-gray-400'
        }`} />
      </button>
    </div>
  )

  const renderStructuredSOAPSection = (title: string, sectionKey: keyof SOAPSection, data: any) => {
    const isStructured = typeof data === 'object' && !Array.isArray(data)
    
    return (
      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center">
          <span className="w-6 h-6 rounded-full bg-clinical-blue text-white text-xs flex items-center justify-center mr-2">
            {title[0]}
          </span>
          {title}
        </h4>
        
        {isStructured ? (
          <div className="bg-gray-50 p-3 rounded-md space-y-2">
            {sectionKey === 'subjective' && (
              <>
                <div className="text-sm">
                  <strong>Status:</strong> {data.template_data?.current_status === 'keeping_well' ? 'Keeping well' : 'Has complaint'}
                </div>
                {data.template_data?.chief_complaint && (
                  <div className="text-sm">
                    <strong>Chief Complaint:</strong> {data.template_data.chief_complaint}
                  </div>
                )}
                {data.template_data?.medication_compliance?.length > 0 && (
                  <div className="text-sm">
                    <strong>Medications:</strong> {data.template_data.medication_compliance.length} medications reviewed
                  </div>
                )}
                {data.narrative_summary && (
                  <div className="text-sm mt-2 p-2 bg-white rounded border">
                    {data.narrative_summary}
                  </div>
                )}
              </>
            )}
            
            {sectionKey === 'objective' && (
              <>
                <div className="text-sm text-gray-600">
                  Physical examination guidance provided based on {clinicalQuestionnaire.template_type} template
                </div>
                {data.clinical_findings_summary && (
                  <div className="text-sm mt-2 p-2 bg-white rounded border">
                    <strong>Clinical Findings:</strong> {data.clinical_findings_summary}
                  </div>
                )}
              </>
            )}
            
            {sectionKey === 'assessment' && (
              <>
                {data.primary_diagnosis && (
                  <div className="text-sm">
                    <strong>Primary Diagnosis:</strong> {data.primary_diagnosis}
                  </div>
                )}
                {data.laboratory_interpretation && (
                  <div className="text-sm">
                    <strong>Lab Interpretation:</strong> {data.laboratory_interpretation}
                  </div>
                )}
                {data.clinical_reasoning && (
                  <div className="text-sm mt-2 p-2 bg-white rounded border">
                    <strong>Clinical Reasoning:</strong> {data.clinical_reasoning}
                  </div>
                )}
              </>
            )}
            
            {sectionKey === 'plan' && (
              <>
                {data.medications?.continue?.length > 0 && (
                  <div className="text-sm">
                    <strong>Continue Medications:</strong> {data.medications.continue.join(', ')}
                  </div>
                )}
                {data.follow_up?.timing && (
                  <div className="text-sm">
                    <strong>Follow-up:</strong> {data.follow_up.timing}
                  </div>
                )}
                {data.lifestyle_recommendations?.length > 0 && (
                  <div className="text-sm">
                    <strong>Lifestyle:</strong> {data.lifestyle_recommendations.join(', ')}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md">
            {data || `No ${title.toLowerCase()} information available`}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="canvas-node min-w-[400px] max-w-[500px]">
      <NodeResizer 
        minWidth={350} 
        minHeight={300} 
        maxWidth={650}
        maxHeight={700}
        shouldResize={() => true}
        handleStyle={{
          backgroundColor: '#f59e0b',
          width: '8px',
          height: '8px',
          border: '2px solid white',
        }}
        lineStyle={{
          borderColor: '#f59e0b',
          borderWidth: '2px',
        }}
      />
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-clinical-blue" />
          <div>
            <h3 className="font-semibold text-gray-900">SOAP Note Generator</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <User className="w-3 h-3 mr-1" />
              {patient.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {currentNote && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                title="Edit SOAP Note"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={!isEditing}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Save Changes"
              >
                <Save className="w-4 h-4" />
              </button>
            </>
          )}
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center space-x-1 px-3 py-1.5 bg-clinical-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
          </button>
        </div>
      </div>

      {/* View Mode Selector */}
      {renderViewModeSelector()}

      {/* Clinical Template Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-blue-800">
          <Stethoscope className="w-4 h-4" />
          <span>Template: <strong>{clinicalQuestionnaire.template_type}</strong> - Dr. Nuqman's clinical approach</span>
        </div>
      </div>

      {/* Content based on view mode */}
      <div className="max-h-96 overflow-y-auto">
        {viewMode === 'questionnaire' && (
          <ClinicalQuestionnairePanel
            questionnaire={clinicalQuestionnaire}
            onUpdate={handleQuestionnaireUpdate}
            patientName={patient.name}
          />
        )}

        {viewMode === 'examination' && (
          <SmartExaminationPrompts
            patient={patient}
            clinical_data={clinical_data}
            questionnaire={clinicalQuestionnaire}
            onHintApplied={handleExaminationHintApplied}
          />
        )}

        {viewMode === 'medication' && (
          <MedicationComplianceTracker
            patient={patient}
            questionnaire={clinicalQuestionnaire}
            onComplianceUpdate={handleComplianceUpdate}
          />
        )}

        {viewMode === 'risk_factors' && (
          <RiskFactorAssessment
            patient={patient}
            questionnaire={clinicalQuestionnaire}
            onRiskFactorUpdate={handleRiskFactorUpdate}
          />
        )}

        {viewMode === 'soap' && currentNote && (
          <div className="space-y-4">
            {/* Note Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(currentNote.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  currentNote.generated_by === 'ai' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {currentNote.generated_by === 'ai' ? 'AI Generated' : 'Manual'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700`}>
                  {currentNote.template_used || clinicalQuestionnaire.template_type}
                </span>
                <div className="flex items-center space-x-1">
                  <span>Confidence: {Math.round(currentNote.confidence_score * 100)}%</span>
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-clinical-blue rounded-full"
                      style={{ width: `${currentNote.confidence_score * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced SOAP Sections */}
            <div className="space-y-4">
              {renderStructuredSOAPSection('Subjective', 'subjective', editedSections.subjective)}
              {renderStructuredSOAPSection('Objective', 'objective', editedSections.objective)}
              {renderStructuredSOAPSection('Assessment', 'assessment', editedSections.assessment)}
              {renderStructuredSOAPSection('Plan', 'plan', editedSections.plan)}
            </div>

            {/* Actions */}
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditedSections(currentNote.soap_sections)
                  }}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-clinical-blue text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode === 'soap' && !currentNote && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm mb-2">No SOAP note generated yet</p>
            <p className="text-xs text-gray-400 mb-4">
              Complete the clinical interview first, then click "Generate" to create an AI-powered SOAP note
            </p>
            <button
              onClick={() => setViewMode('questionnaire')}
              className="px-4 py-2 bg-clinical-blue text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
            >
              Start Clinical Interview
            </button>
          </div>
        )}
      </div>

      {/* Existing Notes Summary */}
      {existingNotes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Previous Notes: {existingNotes.length}</p>
          <div className="flex flex-wrap gap-1">
            {existingNotes.slice(-3).map((note, index) => (
              <span
                key={note.id}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {new Date(note.date).toLocaleDateString()}
              </span>
            ))}
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default SOAPGeneratorNode