import React, { useState, useCallback } from 'react'
import { CheckCircle, Circle, AlertCircle, User, Heart, Stethoscope, Activity } from 'lucide-react'
import type { 
  ClinicalQuestionnaire, 
  SubjectiveTemplate, 
  ObjectiveChecklist, 
  MedicationCompliance, 
  LifestyleFactors, 
  SOCRATESAssessment 
} from '../types'

interface ClinicalQuestionnairePanelProps {
  questionnaire: ClinicalQuestionnaire
  onUpdate: (questionnaire: ClinicalQuestionnaire) => void
  patientName?: string
}

const ClinicalQuestionnairePanel: React.FC<ClinicalQuestionnairePanelProps> = ({
  questionnaire,
  onUpdate,
  patientName = 'Patient'
}) => {
  const [activeTab, setActiveTab] = useState<'subjective' | 'objective' | 'review'>('subjective')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['chief_complaint']))

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }, [])

  const updateSubjectiveTemplate = useCallback((updates: Partial<SubjectiveTemplate>) => {
    const updatedQuestionnaire = {
      ...questionnaire,
      subjective_template: {
        ...questionnaire.subjective_template,
        ...updates
      }
    }
    onUpdate(updatedQuestionnaire)
  }, [questionnaire, onUpdate])

  const updateClinicalReview = useCallback((updates: Partial<typeof questionnaire.clinical_review>) => {
    const updatedQuestionnaire = {
      ...questionnaire,
      clinical_review: {
        ...questionnaire.clinical_review,
        ...updates
      }
    }
    onUpdate(updatedQuestionnaire)
  }, [questionnaire, onUpdate])

  const updateMedicationCompliance = useCallback((index: number, updates: Partial<MedicationCompliance>) => {
    const updatedMedications = [...questionnaire.subjective_template.medication_compliance]
    updatedMedications[index] = { ...updatedMedications[index], ...updates }
    
    updateSubjectiveTemplate({
      medication_compliance: updatedMedications
    })
  }, [questionnaire.subjective_template.medication_compliance, updateSubjectiveTemplate])

  const updateLifestyleFactors = useCallback((updates: Partial<LifestyleFactors>) => {
    updateSubjectiveTemplate({
      lifestyle_factors: {
        ...questionnaire.subjective_template.lifestyle_factors,
        ...updates
      }
    })
  }, [questionnaire.subjective_template.lifestyle_factors, updateSubjectiveTemplate])

  const renderSectionHeader = (title: string, icon: React.ReactNode, sectionId: string, isComplete: boolean) => (
    <button
      onClick={() => toggleSection(sectionId)}
      className="w-full flex items-center justify-between p-3 glass-panel/5 hover:glass-panel/10 rounded-lg transition-colors"
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span className="font-medium text-white">{title}</span>
        {isComplete ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <Circle className="w-4 h-4 text-gray-400" />
        )}
      </div>
      <span className="text-sm text-white/70">
        {expandedSections.has(sectionId) ? '▼' : '▶'}
      </span>
    </button>
  )

  const renderSubjectiveTab = () => (
    <div className="space-y-4">
      {/* Chief Complaint Section */}
      <div>
        {renderSectionHeader(
          'Current Status & Chief Complaint', 
          <User className="w-4 h-4 text-clinical-blue" />, 
          'chief_complaint',
          !!questionnaire.subjective_template.chief_complaint
        )}
        {expandedSections.has('chief_complaint') && (
          <div className="mt-3 p-4 glass-panel border border-white/20 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                How is {patientName} today?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSubjectiveTemplate({ current_status: 'keeping_well' })}
                  className={`p-2 text-sm rounded-md border transition-all duration-200 ${
                    questionnaire.subjective_template.current_status === 'keeping_well'
                      ? 'bg-green-600 border-green-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/30 text-white/80 hover:bg-white/10'
                  }`}
                >
                  Keeping well
                </button>
                <button
                  onClick={() => updateSubjectiveTemplate({ current_status: 'has_complaint' })}
                  className={`p-2 text-sm rounded-md border transition-all duration-200 ${
                    questionnaire.subjective_template.current_status === 'has_complaint'
                      ? 'bg-orange-600 border-orange-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/30 text-white/80 hover:bg-white/10'
                  }`}
                >
                  Has complaint
                </button>
              </div>
            </div>

            {questionnaire.subjective_template.current_status === 'has_complaint' && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Chief Complaint
                </label>
                <textarea
                  value={questionnaire.subjective_template.chief_complaint}
                  onChange={(e) => updateSubjectiveTemplate({ chief_complaint: e.target.value })}
                  className="w-full p-2 border border-white/30 rounded-md text-sm bg-white/10 text-white placeholder:text-white/50"
                  rows={2}
                  placeholder="Describe the main concern or complaint..."
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Medication Compliance Section */}
      <div>
        {renderSectionHeader(
          'Medication Compliance', 
          <Heart className="w-4 h-4 text-red-500" />, 
          'medications',
          questionnaire.subjective_template.medication_compliance.length > 0
        )}
        {expandedSections.has('medications') && (
          <div className="mt-3 p-4 glass-panel border border-white/20 rounded-lg space-y-4">
            <div className="text-sm text-white/80 mb-3">
              Review current medications and assess compliance
            </div>
            
            {questionnaire.subjective_template.medication_compliance.map((med, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={med.medication_name}
                    onChange={(e) => updateMedicationCompliance(index, { medication_name: e.target.value })}
                    className="font-medium text-sm bg-transparent border-none outline-none flex-1"
                    placeholder="Medication name"
                  />
                  <select
                    value={med.actual_compliance}
                    onChange={(e) => updateMedicationCompliance(index, { 
                      actual_compliance: e.target.value as 'compliant' | 'partial' | 'non-compliant' 
                    })}
                    className="text-xs border border-white/30 rounded px-2 py-1"
                  >
                    <option value="compliant">Compliant</option>
                    <option value="partial">Partial</option>
                    <option value="non-compliant">Non-compliant</option>
                  </select>
                </div>
                
                <div className="text-xs text-gray-500">
                  <input
                    type="text"
                    value={med.prescribed_dose}
                    onChange={(e) => updateMedicationCompliance(index, { prescribed_dose: e.target.value })}
                    className="border-none outline-none bg-transparent"
                    placeholder="Prescribed dose"
                  />
                </div>

                {med.actual_compliance !== 'compliant' && (
                  <div className="text-xs">
                    <label className="block text-white/80 mb-1">Missed doses per week:</label>
                    <input
                      type="number"
                      min="0"
                      max="21"
                      value={med.missed_doses_per_week}
                      onChange={(e) => updateMedicationCompliance(index, { 
                        missed_doses_per_week: parseInt(e.target.value) || 0 
                      })}
                      className="w-16 px-2 py-1 border border-white/30 rounded"
                    />
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={() => {
                const newMed: MedicationCompliance = {
                  medication_name: '',
                  prescribed_dose: '',
                  actual_compliance: 'compliant',
                  missed_doses_per_week: 0,
                  side_effects: [],
                  patient_concerns: ''
                }
                updateSubjectiveTemplate({
                  medication_compliance: [...questionnaire.subjective_template.medication_compliance, newMed]
                })
              }}
              className="w-full p-2 border border-dashed border-white/30 rounded-lg text-sm text-white/80 hover:bg-white/10 bg-white/5"
            >
              + Add Medication
            </button>
          </div>
        )}
      </div>

      {/* Symptom Review Section */}
      <div>
        {renderSectionHeader(
          'Symptom Review', 
          <Stethoscope className="w-4 h-4 text-blue-500" />, 
          'symptoms',
          Object.values(questionnaire.subjective_template.symptom_review).some(v => v === true || (Array.isArray(v) && v.length > 0))
        )}
        {expandedSections.has('symptoms') && (
          <div className="mt-3 p-4 glass-panel border border-white/20 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(questionnaire.subjective_template.symptom_review).map(([key, value]) => {
                if (key === 'other_symptoms') return null
                
                const displayName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                
                return (
                  <label key={key} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => {
                        updateSubjectiveTemplate({
                          symptom_review: {
                            ...questionnaire.subjective_template.symptom_review,
                            [key]: e.target.checked
                          }
                        })
                      }}
                      className="rounded border-white/30 text-clinical-blue focus:ring-clinical-blue"
                    />
                    <span className="text-white/90">{displayName}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lifestyle Factors Section */}
      <div>
        {renderSectionHeader(
          'Lifestyle Assessment', 
          <Activity className="w-4 h-4 text-orange-500" />, 
          'lifestyle',
          questionnaire.subjective_template.lifestyle_factors.smoking_status !== 'never' || 
          questionnaire.subjective_template.lifestyle_factors.exercise_frequency !== 'none'
        )}
        {expandedSections.has('lifestyle') && (
          <div className="mt-3 p-4 glass-panel border border-white/20 rounded-lg space-y-4">
            {/* Smoking Assessment */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Smoking Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(['never', 'former', 'current'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => updateLifestyleFactors({ smoking_status: status })}
                    className={`p-2 text-xs rounded-md border capitalize ${
                      questionnaire.subjective_template.lifestyle_factors.smoking_status === status
                        ? 'bg-clinical-blue text-white border-clinical-blue'
                        : 'bg-white/5 border-white/30 text-white/80'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              
              {questionnaire.subjective_template.lifestyle_factors.smoking_status === 'current' && (
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={questionnaire.subjective_template.lifestyle_factors.cigarettes_per_day || ''}
                    onChange={(e) => updateLifestyleFactors({ 
                      cigarettes_per_day: parseInt(e.target.value) || undefined 
                    })}
                    className="w-16 px-2 py-1 text-xs border border-white/30 rounded"
                    placeholder="0"
                  />
                  <span className="text-xs text-white/80">cigarettes per day</span>
                </div>
              )}
            </div>

            {/* Exercise Assessment */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Exercise Frequency</label>
              <div className="grid grid-cols-2 gap-2">
                {(['none', 'rare', 'weekly', 'daily'] as const).map(freq => (
                  <button
                    key={freq}
                    onClick={() => updateLifestyleFactors({ exercise_frequency: freq })}
                    className={`p-2 text-xs rounded-md border capitalize ${
                      questionnaire.subjective_template.lifestyle_factors.exercise_frequency === freq
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white/5 border-white/30 text-white/80'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
              
              {questionnaire.subjective_template.lifestyle_factors.exercise_frequency !== 'none' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={questionnaire.subjective_template.lifestyle_factors.exercise_type}
                    onChange={(e) => updateLifestyleFactors({ exercise_type: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-white/30 rounded"
                    placeholder="Type of exercise (e.g., walking, swimming)"
                  />
                </div>
              )}
            </div>

            {/* Diet Assessment */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Diet Modifications</label>
              <div className="grid grid-cols-3 gap-2">
                {(['none', 'attempted', 'adherent'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => updateLifestyleFactors({ diet_modifications: status })}
                    className={`p-2 text-xs rounded-md border capitalize ${
                      questionnaire.subjective_template.lifestyle_factors.diet_modifications === status
                        ? 'bg-clinical-blue text-white border-clinical-blue'
                        : 'bg-white/5 border-white/30 text-white/80'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderObjectiveTab = () => (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Physical Examination Guidance</p>
            <p>Use these prompts to guide your physical examination of {patientName}. Focus on systematic assessment rather than lab results.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-white">General Appearance</h4>
        <div className="glass-panel border border-white/20 rounded-lg p-4 space-y-2">
          <p className="text-sm text-white/90">• How does {patientName} look today?</p>
          <p className="text-sm text-white/90">• Any signs of discomfort or respiratory distress?</p>
          <p className="text-sm text-white/90">• What is the hydration status?</p>
          <p className="text-sm text-white/90">• How is the general color and perfusion?</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-white">Vital Signs Assessment</h4>
        <div className="glass-panel border border-white/20 rounded-lg p-4 space-y-2">
          <p className="text-sm text-white/90">• How is the pulse volume & rhythm?</p>
          <p className="text-sm text-white/90">• Blood pressure interpretation in context</p>
          <p className="text-sm text-white/90">• Respiratory rate and pattern assessment</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-white">System Examination</h4>
        <div className="grid grid-cols-1 gap-3">
          <div className="glass-panel border border-white/20 rounded-lg p-3">
            <h5 className="font-medium text-sm text-white mb-2">Cardiovascular</h5>
            <ul className="text-xs text-white/80 space-y-1">
              <li>• Heart sounds and murmurs</li>
              <li>• JVP assessment</li>
              <li>• Peripheral edema check</li>
            </ul>
          </div>
          
          <div className="glass-panel border border-white/20 rounded-lg p-3">
            <h5 className="font-medium text-sm text-white mb-2">Respiratory</h5>
            <ul className="text-xs text-white/80 space-y-1">
              <li>• Breathing pattern and chest expansion</li>
              <li>• Lung fields auscultation</li>
              <li>• Any adventitious sounds</li>
            </ul>
          </div>
          
          <div className="glass-panel border border-white/20 rounded-lg p-3">
            <h5 className="font-medium text-sm text-white mb-2">Abdominal</h5>
            <ul className="text-xs text-white/80 space-y-1">
              <li>• General inspection and distension</li>
              <li>• Palpation findings</li>
              <li>• Organomegaly assessment</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-white">Clinical Signs</h4>
        <div className="glass-panel border border-white/20 rounded-lg p-4 space-y-2">
          <p className="text-sm text-white/90">• Any signs of heart failure? (raised JVP, pedal edema)</p>
          <p className="text-sm text-white/90">• Signs of dehydration or fluid overload?</p>
          <p className="text-sm text-white/90">• Perfusion and circulation status</p>
        </div>
      </div>
    </div>
  )

  const renderReviewTab = () => (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Clinical Review Template</h4>
        <div className="text-sm text-white/80 space-y-1">
          <p>Age and gender: {questionnaire.clinical_review.patient_demographics.age} years, {questionnaire.clinical_review.patient_demographics.gender}</p>
          <p>Living situation: {questionnaire.clinical_review.patient_demographics.living_situation || 'Not specified'}</p>
          <p>Occupation: {questionnaire.clinical_review.patient_demographics.occupation_status}</p>
          <p>ADL: {questionnaire.clinical_review.patient_demographics.activities_of_daily_living}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-white">Visit Type & Purpose</h4>
        <div className="grid grid-cols-2 gap-2">
          {(['routine_follow_up', 'urgent', 'new_complaint', 'medication_review'] as const).map(type => (
            <button
              key={type}
              onClick={() => updateClinicalReview({ visit_type: type })}
              className={`p-2 text-xs rounded-md border ${
                questionnaire.clinical_review.visit_type === type
                  ? 'bg-clinical-blue text-white border-clinical-blue'
                  : 'bg-white/5 border-white/30 text-white/80 hover:bg-white/10'
              }`}
            >
              {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-white">Investigations Planned</h4>
        <div className="glass-panel border border-white/20 rounded-lg p-4">
          <div className="text-sm text-white/80 space-y-1">
            <p>• FBS (Fasting Blood Sugar)</p>
            <p>• HbA1c (Glycated Hemoglobin)</p>
            <p>• Creat (Creatinine)</p>
            <p>• TC (Total Cholesterol)</p>
            <p>• LDL (Low-Density Lipoprotein)</p>
            <p>• UFEME (Urine Full Examination)</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-lg shadow-sm border border-white/20">
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <h3 className="text-lg font-semibold text-white">Clinical Assessment for {patientName}</h3>
        <p className="text-sm text-white/80">Complete this structured clinical interview and examination guide</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-white/20">
        <nav className="flex">
          {[
            { id: 'subjective', name: 'Subjective', icon: User },
            { id: 'objective', name: 'Objective', icon: Stethoscope },
            { id: 'review', name: 'Review', icon: CheckCircle }
          ].map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === id
                  ? 'border-clinical-blue text-clinical-blue'
                  : 'border-transparent text-gray-500 hover:text-white/90'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{name}</span>
              {/* Completion indicator */}
              <div className={`w-2 h-2 rounded-full ${
                questionnaire.completion_status[`${id}_complete` as keyof typeof questionnaire.completion_status]
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`} />
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'subjective' && renderSubjectiveTab()}
        {activeTab === 'objective' && renderObjectiveTab()}
        {activeTab === 'review' && renderReviewTab()}
      </div>
    </div>
  )
}

export default ClinicalQuestionnairePanel