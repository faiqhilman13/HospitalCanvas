import React, { useState, useMemo } from 'react'
import { 
  Stethoscope, 
  Heart, 
  Wind, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Info,
  TrendingUp,
  Eye,
  Brain
} from 'lucide-react'
import type { 
  Patient, 
  ClinicalData, 
  SmartExaminationHint, 
  ClinicalQuestionnaire 
} from '../types'

interface SmartExaminationPromptsProps {
  patient: Patient
  clinical_data: ClinicalData
  questionnaire: ClinicalQuestionnaire
  onHintApplied: (hintId: string, findings: string) => void
}

const SmartExaminationPrompts: React.FC<SmartExaminationPromptsProps> = ({
  patient,
  clinical_data,
  questionnaire,
  onHintApplied
}) => {
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set())
  const [appliedHints, setAppliedHints] = useState<Set<string>>(new Set())
  const [hintFindings, setHintFindings] = useState<Record<string, string>>({})

  // Generate smart examination hints based on patient data
  const smartHints = useMemo<SmartExaminationHint[]>(() => {
    const hints: SmartExaminationHint[] = []
    const patientConditions = extractPatientConditions(patient, clinical_data)
    const patientAge = patient.age || 0

    // Kidney disease specific hints
    if (patientConditions.includes('kidney_disease') || patientConditions.includes('chronic_kidney_disease')) {
      hints.push({
        id: 'kidney_fluid_status',
        category: 'cardiovascular',
        condition_specific: ['kidney_disease', 'chronic_kidney_disease'],
        priority: 'high',
        prompt_text: 'Assess fluid status: Check for peripheral edema, JVP elevation, pulmonary edema signs',
        clinical_rationale: 'CKD patients are prone to fluid retention and volume overload',
        abnormal_findings_guidance: [
          'Peripheral edema: Grade 1+ to 4+ pitting edema in ankles/legs',
          'Elevated JVP: >3cm above sternal angle',
          'Pulmonary edema: Bibasilar crackles, dyspnea',
          'Fluid overload: Weight gain >2kg from baseline'
        ],
        follow_up_required: true,
        risk_factors_addressed: ['fluid_overload', 'hypertension', 'cardiac_strain']
      })

      hints.push({
        id: 'kidney_bp_assessment',
        category: 'cardiovascular',
        condition_specific: ['kidney_disease'],
        priority: 'high',
        prompt_text: 'Blood pressure assessment: Check for hypertension and postural changes',
        clinical_rationale: 'CKD commonly causes secondary hypertension and electrolyte imbalances',
        abnormal_findings_guidance: [
          'Hypertension: >140/90 mmHg consistently',
          'Postural hypotension: >20mmHg systolic drop on standing',
          'Wide pulse pressure: May indicate arterial stiffness'
        ],
        follow_up_required: true,
        risk_factors_addressed: ['cardiovascular_disease', 'stroke_risk']
      })
    }

    // Diabetes specific hints  
    if (patientConditions.includes('diabetes') || patientConditions.includes('type_2_diabetes')) {
      hints.push({
        id: 'diabetes_foot_exam',
        category: 'neurological',
        condition_specific: ['diabetes', 'type_2_diabetes'],
        priority: 'high',
        prompt_text: 'Diabetic foot examination: Check sensation, pulses, ulcers, deformities',
        clinical_rationale: 'Diabetes causes peripheral neuropathy and vascular complications',
        abnormal_findings_guidance: [
          'Sensory loss: Use monofilament test at plantar surfaces',
          'Absent pulses: Dorsalis pedis, posterior tibial',
          'Ulceration: Particularly between toes, pressure points',
          'Deformities: Claw toes, Charcot foot changes'
        ],
        follow_up_required: true,
        risk_factors_addressed: ['diabetic_foot_ulcer', 'amputation_risk']
      })

      hints.push({
        id: 'diabetes_eye_screen',
        category: 'neurological',
        condition_specific: ['diabetes'],
        priority: 'medium',
        prompt_text: 'Basic visual assessment: Check for visual changes, refer for dilated eye exam',
        clinical_rationale: 'Diabetic retinopathy is a leading cause of blindness',
        abnormal_findings_guidance: [
          'Visual changes: Blurred vision, floaters, dark spots',
          'Refer urgently: Any new visual symptoms',
          'Annual screening: Dilated fundoscopy required'
        ],
        follow_up_required: true,
        risk_factors_addressed: ['diabetic_retinopathy', 'vision_loss']
      })
    }

    // Cardiovascular specific hints
    if (patientConditions.includes('cardiovascular') || patientConditions.includes('hypertension') || patientAge > 65) {
      hints.push({
        id: 'cv_comprehensive_exam',
        category: 'cardiovascular',
        condition_specific: ['cardiovascular', 'hypertension'],
        priority: 'high',
        prompt_text: 'Comprehensive cardiac assessment: Heart sounds, murmurs, peripheral perfusion',
        clinical_rationale: 'Early detection of cardiac complications and progression',
        abnormal_findings_guidance: [
          'New murmurs: Systolic >3/6 or any diastolic murmur',
          'Irregular rhythm: Atrial fibrillation, frequent ectopics',
          'Poor perfusion: Cool extremities, delayed capillary refill',
          'S3 gallop: Sign of heart failure'
        ],
        follow_up_required: true,
        risk_factors_addressed: ['heart_failure', 'arrhythmia', 'valve_disease']
      })
    }

    // General geriatric assessment for elderly patients
    if (patientAge > 75) {
      hints.push({
        id: 'geriatric_functional_assessment',
        category: 'general',
        condition_specific: ['elderly_care'],
        priority: 'medium',
        prompt_text: 'Functional assessment: Mobility, balance, cognitive status, fall risk',
        clinical_rationale: 'Comprehensive geriatric assessment prevents complications',
        abnormal_findings_guidance: [
          'Mobility issues: Unsteady gait, requires assistance',
          'Fall risk: History of falls, balance problems',
          'Cognitive changes: Memory issues, confusion',
          'Frailty indicators: Unintentional weight loss, weakness'
        ],
        follow_up_required: false,
        risk_factors_addressed: ['fall_risk', 'functional_decline', 'cognitive_decline']
      })
    }

    // Medication-related examination hints
    if (questionnaire.subjective_template.medication_compliance.length > 3) {
      hints.push({
        id: 'polypharmacy_assessment',
        category: 'general',
        condition_specific: ['polypharmacy'],
        priority: 'medium',
        prompt_text: 'Polypharmacy assessment: Check for drug interactions, side effects, adherence',
        clinical_rationale: 'Multiple medications increase risk of adverse drug events',
        abnormal_findings_guidance: [
          'Side effects: Dizziness, confusion, GI upset',
          'Drug interactions: Review combination effects',
          'Adherence issues: Pill burden, complexity',
          'Inappropriate medications: Beers criteria review'
        ],
        follow_up_required: true,
        risk_factors_addressed: ['adverse_drug_events', 'medication_errors']
      })
    }

    // Sort by priority and condition relevance
    return hints.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      return priorityWeight[b.priority] - priorityWeight[a.priority]
    })
  }, [patient, clinical_data, questionnaire])

  // Helper function to extract patient conditions from clinical data
  function extractPatientConditions(patient: Patient, clinical_data: ClinicalData): string[] {
    const conditions: string[] = []
    
    // Extract from clinical summary
    const summary = clinical_data?.summary?.clinical_summary?.toLowerCase() || ''
    
    if (summary.includes('kidney') || summary.includes('chronic kidney disease') || summary.includes('ckd')) {
      conditions.push('kidney_disease')
    }
    if (summary.includes('diabetes') || summary.includes('dm') || summary.includes('glucose')) {
      conditions.push('diabetes')
    }
    if (summary.includes('hypertension') || summary.includes('high blood pressure') || summary.includes('htn')) {
      conditions.push('hypertension')
    }
    if (summary.includes('cardiovascular') || summary.includes('cardiac') || summary.includes('heart')) {
      conditions.push('cardiovascular')
    }
    
    return conditions
  }

  const toggleHintExpansion = (hintId: string) => {
    const newExpanded = new Set(expandedHints)
    if (newExpanded.has(hintId)) {
      newExpanded.delete(hintId)
    } else {
      newExpanded.add(hintId)
    }
    setExpandedHints(newExpanded)
  }

  const handleHintApplication = (hintId: string, findings: string) => {
    setAppliedHints(prev => new Set(prev).add(hintId))
    setHintFindings(prev => ({ ...prev, [hintId]: findings }))
    onHintApplied(hintId, findings)
  }

  const getCategoryIcon = (category: SmartExaminationHint['category']) => {
    const iconMap = {
      general: Activity,
      cardiovascular: Heart,
      respiratory: Wind,
      abdominal: Activity,
      neurological: Brain,
      endocrine: TrendingUp
    }
    const Icon = iconMap[category]
    return <Icon className="w-4 h-4" />
  }

  const getPriorityColor = (priority: SmartExaminationHint['priority']) => {
    const colorMap = {
      high: 'border-red-200 bg-red-50 text-red-800',
      medium: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      low: 'border-blue-200 bg-blue-50 text-blue-800'
    }
    return colorMap[priority]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Stethoscope className="w-5 h-5 text-clinical-blue" />
        <h3 className="font-semibold text-gray-900">Smart Examination Prompts</h3>
        <span className="text-xs bg-clinical-blue text-white px-2 py-0.5 rounded-full">
          {smartHints.length} hints
        </span>
      </div>

      {smartHints.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No specific examination hints for this patient profile</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {smartHints.map((hint) => (
            <div
              key={hint.id}
              className={`border rounded-lg p-3 transition-all ${getPriorityColor(hint.priority)} ${
                appliedHints.has(hint.id) ? 'opacity-75' : ''
              }`}
            >
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => toggleHintExpansion(hint.id)}
              >
                <div className="flex items-start space-x-2 flex-1">
                  {getCategoryIcon(hint.category)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{hint.prompt_text}</span>
                      {appliedHints.has(hint.id) && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="capitalize">{hint.category}</span>
                      <span className="text-gray-400">•</span>
                      <span className="capitalize">{hint.priority} priority</span>
                      {hint.condition_specific.length > 0 && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{hint.condition_specific.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <AlertCircle className={`w-4 h-4 ${expandedHints.has(hint.id) ? 'transform rotate-180' : ''} transition-transform`} />
              </div>

              {expandedHints.has(hint.id) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Clinical Rationale:</p>
                    <p className="text-xs text-gray-600">{hint.clinical_rationale}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Abnormal Findings to Watch For:</p>
                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                      {hint.abnormal_findings_guidance.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  </div>

                  {hint.risk_factors_addressed.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Risk Factors Addressed:</p>
                      <div className="flex flex-wrap gap-1">
                        {hint.risk_factors_addressed.map((risk, index) => (
                          <span 
                            key={index}
                            className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full"
                          >
                            {risk.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!appliedHints.has(hint.id) && (
                    <div className="mt-3">
                      <textarea
                        placeholder="Record your examination findings..."
                        className="w-full text-xs border border-gray-300 rounded p-2 resize-none"
                        rows={2}
                        value={hintFindings[hint.id] || ''}
                        onChange={(e) => setHintFindings(prev => ({ ...prev, [hint.id]: e.target.value }))}
                      />
                      <button
                        onClick={() => handleHintApplication(hint.id, hintFindings[hint.id] || '')}
                        disabled={!hintFindings[hint.id]?.trim()}
                        className="mt-2 text-xs bg-clinical-blue text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply Findings
                      </button>
                    </div>
                  )}

                  {appliedHints.has(hint.id) && hintFindings[hint.id] && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs font-medium text-green-800 mb-1">Recorded Findings:</p>
                      <p className="text-xs text-green-700">{hintFindings[hint.id]}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SmartExaminationPrompts