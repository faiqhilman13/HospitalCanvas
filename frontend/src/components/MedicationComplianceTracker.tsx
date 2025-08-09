import React, { useState, useMemo } from 'react'
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Info,
  Edit3,
  Save
} from 'lucide-react'
import type { 
  Patient, 
  MedicationReview, 
  ClinicalQuestionnaire,
  MedicationCompliance 
} from '../types'

interface MedicationComplianceTrackerProps {
  patient: Patient
  questionnaire: ClinicalQuestionnaire
  onComplianceUpdate: (medicationId: string, compliance: MedicationCompliance) => void
}

const MedicationComplianceTracker: React.FC<MedicationComplianceTrackerProps> = ({
  patient,
  questionnaire,
  onComplianceUpdate
}) => {
  const [editingMedication, setEditingMedication] = useState<string | null>(null)
  const [medicationReviews, setMedicationReviews] = useState<Record<string, MedicationReview>>({})

  // Generate medication reviews from questionnaire data
  const currentMedications = useMemo(() => {
    return questionnaire.subjective_template.medication_compliance.map((med, index) => {
      const medicationId = `med-${index}`
      
      // Create or update medication review
      const existingReview = medicationReviews[medicationId]
      
      const review: MedicationReview = existingReview || {
        medication_id: medicationId,
        medication_name: med.medication_name,
        current_dose: med.prescribed_dose,
        prescribed_dose: med.prescribed_dose,
        compliance_status: med.actual_compliance,
        last_taken: calculateLastTaken(med.missed_doses_per_week),
        missed_doses_weekly: med.missed_doses_per_week,
        side_effects_reported: med.side_effects || [],
        effectiveness_rating: estimateEffectiveness(med.actual_compliance),
        patient_satisfaction: 3, // Default, can be updated
        requires_adjustment: needsAdjustment(med),
        clinical_notes: med.patient_concerns || ''
      }

      return { compliance: med, review }
    })
  }, [questionnaire, medicationReviews])

  // Helper functions
  function calculateLastTaken(missedPerWeek: number): string {
    if (missedPerWeek === 0) return 'Today'
    if (missedPerWeek <= 1) return 'Yesterday'
    if (missedPerWeek <= 3) return '2-3 days ago'
    return 'More than 3 days ago'
  }

  function estimateEffectiveness(compliance: string): number {
    const effectivenessMap = {
      'compliant': 4,
      'partial': 3,
      'non-compliant': 1
    }
    return effectivenessMap[compliance as keyof typeof effectivenessMap] || 3
  }

  function needsAdjustment(med: MedicationCompliance): boolean {
    return med.actual_compliance === 'non-compliant' || 
           med.side_effects.length > 0 || 
           med.missed_doses_per_week > 2
  }

  const getComplianceColor = (status: string) => {
    const colorMap = {
      'compliant': 'text-green-200 bg-green-500/10 border-green-400/30',
      'partial': 'text-yellow-200 bg-yellow-500/10 border-yellow-400/30',
      'non_compliant': 'text-red-200 bg-red-500/10 border-red-400/30',
      'non-compliant': 'text-red-200 bg-red-500/10 border-red-400/30',
      'unknown': 'text-white/80 bg-white/5 border-white/20'
    }
    return colorMap[status as keyof typeof colorMap] || colorMap.unknown
  }

  const getComplianceIcon = (status: string) => {
    const iconMap = {
      'compliant': CheckCircle,
      'partial': Clock,
      'non_compliant': XCircle,
      'non-compliant': XCircle,
      'unknown': Info
    }
    const Icon = iconMap[status as keyof typeof iconMap] || Info
    return <Icon className="w-4 h-4" />
  }

  const handleReviewUpdate = (medicationId: string, updates: Partial<MedicationReview>) => {
    setMedicationReviews(prev => ({
      ...prev,
      [medicationId]: {
        ...prev[medicationId],
        ...updates
      }
    }))
  }

  const generateComplianceInsights = () => {
    const totalMeds = currentMedications.length
    const compliantMeds = currentMedications.filter(m => m.compliance.actual_compliance === 'compliant').length
    const partialMeds = currentMedications.filter(m => m.compliance.actual_compliance === 'partial').length
    const nonCompliantMeds = currentMedications.filter(m => m.compliance.actual_compliance === 'non-compliant').length
    
    const complianceRate = totalMeds > 0 ? (compliantMeds / totalMeds * 100) : 0
    const totalSideEffects = currentMedications.reduce((sum, m) => sum + (m.compliance.side_effects?.length || 0), 0)
    
    return {
      totalMeds,
      compliantMeds,
      partialMeds,
      nonCompliantMeds,
      complianceRate: Math.round(complianceRate),
      totalSideEffects,
      highRiskMeds: currentMedications.filter(m => m.review.requires_adjustment).length
    }
  }

  const insights = generateComplianceInsights()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Pill className="w-5 h-5 text-clinical-blue" />
          <h3 className="font-semibold text-white">Medication Compliance</h3>
        </div>
        <span className="text-xs bg-clinical-blue text-white px-2 py-0.5 rounded-full">
          {insights.totalMeds} medications
        </span>
      </div>

      {/* Compliance Overview */}
      <div className="bg-white/5 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Overall Compliance Rate</span>
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${insights.complianceRate >= 80 ? 'text-green-600' : insights.complianceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {insights.complianceRate}%
            </span>
            {insights.complianceRate >= 80 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
          </div>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${insights.complianceRate >= 80 ? 'bg-green-500' : insights.complianceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${insights.complianceRate}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
          <div className="text-center p-2 bg-green-500/10 rounded">
            <div className="font-semibold text-green-300">{insights.compliantMeds}</div>
            <div className="text-white/80">Compliant</div>
          </div>
          <div className="text-center p-2 bg-yellow-500/10 rounded">
            <div className="font-semibold text-yellow-300">{insights.partialMeds}</div>
            <div className="text-white/80">Partial</div>
          </div>
          <div className="text-center p-2 bg-red-500/10 rounded">
            <div className="font-semibold text-red-300">{insights.nonCompliantMeds}</div>
            <div className="text-white/80">Non-compliant</div>
          </div>
        </div>

        {insights.highRiskMeds > 0 && (
          <div className="mt-2 p-2 bg-orange-500/10 border border-orange-400/30 rounded text-xs">
            <div className="flex items-center space-x-1 text-orange-300">
              <AlertTriangle className="w-3 h-3" />
              <span className="font-medium">{insights.highRiskMeds} medications require clinical review</span>
            </div>
          </div>
        )}
      </div>

      {/* Medication List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {currentMedications.length === 0 ? (
          <div className="text-center py-6 text-white/70">
            <Pill className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No medications recorded in questionnaire</p>
          </div>
        ) : (
          currentMedications.map(({ compliance, review }) => (
            <div 
              key={review.medication_id}
              className={`border rounded-lg p-3 ${getComplianceColor(compliance.actual_compliance)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{compliance.medication_name}</span>
                    {getComplianceIcon(compliance.actual_compliance)}
                    {review.requires_adjustment && (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <div className="text-xs text-white/80 space-y-0.5">
                    <div>Dose: {compliance.prescribed_dose}</div>
                    <div>Missed: {compliance.missed_doses_per_week}/week</div>
                    <div>Last taken: {review.last_taken}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => setEditingMedication(
                    editingMedication === review.medication_id ? null : review.medication_id
                  )}
                  className="p-1 text-gray-400 hover:text-white/80"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Side Effects */}
              {compliance.side_effects && compliance.side_effects.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-white/90 mb-1">Reported Side Effects:</div>
                  <div className="flex flex-wrap gap-1">
                    {compliance.side_effects.map((effect, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-red-500/20 text-red-200 px-2 py-0.5 rounded-full"
                      >
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Patient Concerns */}
              {compliance.patient_concerns && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-white/90 mb-1">Patient Concerns:</div>
                  <p className="text-xs text-white/80 italic">{compliance.patient_concerns}</p>
                </div>
              )}

              {/* Expanded Review Section */}
              {editingMedication === review.medication_id && (
                <div className="mt-3 pt-3 border-t border-white/20 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-white/90">Effectiveness (1-5)</label>
                      <select
                        value={review.effectiveness_rating}
                        onChange={(e) => handleReviewUpdate(review.medication_id, {
                          effectiveness_rating: parseInt(e.target.value)
                        })}
                        className="w-full text-xs bg-white/10 text-white border border-white/30 rounded p-1 mt-1 focus:border-white/50 focus:outline-none"
                      >
                        <option value={1}>1 - Not effective</option>
                        <option value={2}>2 - Slightly effective</option>
                        <option value={3}>3 - Moderately effective</option>
                        <option value={4}>4 - Very effective</option>
                        <option value={5}>5 - Extremely effective</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-white/90">Satisfaction (1-5)</label>
                      <select
                        value={review.patient_satisfaction}
                        onChange={(e) => handleReviewUpdate(review.medication_id, {
                          patient_satisfaction: parseInt(e.target.value)
                        })}
                        className="w-full text-xs bg-white/10 text-white border border-white/30 rounded p-1 mt-1 focus:border-white/50 focus:outline-none"
                      >
                        <option value={1}>1 - Very unsatisfied</option>
                        <option value={2}>2 - Unsatisfied</option>
                        <option value={3}>3 - Neutral</option>
                        <option value={4}>4 - Satisfied</option>
                        <option value={5}>5 - Very satisfied</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-white/90">Clinical Notes</label>
                    <textarea
                      value={review.clinical_notes}
                      onChange={(e) => handleReviewUpdate(review.medication_id, {
                        clinical_notes: e.target.value
                      })}
                      placeholder="Add clinical observations, plan changes, etc..."
                      className="w-full text-xs bg-white/10 text-white placeholder:text-white/50 border border-white/30 rounded p-2 mt-1 resize-none focus:border-white/50 focus:outline-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-xs">
                      <input
                        type="checkbox"
                        checked={review.requires_adjustment}
                        onChange={(e) => handleReviewUpdate(review.medication_id, {
                          requires_adjustment: e.target.checked
                        })}
                        className="rounded"
                      />
                      <span>Requires adjustment/review</span>
                    </label>
                    
                    <button
                      onClick={() => {
                        onComplianceUpdate(review.medication_id, compliance)
                        setEditingMedication(null)
                      }}
                      className="flex items-center space-x-1 text-xs bg-clinical-blue text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Clinical Recommendations */}
              {review.requires_adjustment && (
                <div className="mt-2 p-2 bg-orange-500/10 border border-orange-400/30 rounded">
                  <div className="text-xs font-medium text-orange-200 mb-1">Clinical Action Required:</div>
                  <ul className="text-xs text-orange-300 list-disc list-inside">
                    {compliance.actual_compliance === 'non-compliant' && (
                      <li>Address barriers to medication adherence</li>
                    )}
                    {compliance.side_effects.length > 0 && (
                      <li>Review side effects and consider alternative therapy</li>
                    )}
                    {compliance.missed_doses_per_week > 2 && (
                      <li>Consider simplifying dosing regimen or medication reminders</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MedicationComplianceTracker