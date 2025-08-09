import React, { useState, useMemo } from 'react'
import { 
  AlertTriangle, 
  Activity, 
  Heart, 
  Scale, 
  Cigarette,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import type { 
  Patient, 
  ClinicalQuestionnaire,
  RiskFactorAssessment as RiskFactorAssessmentType,
  LifestyleFactors 
} from '../types'

interface RiskFactorAssessmentProps {
  patient: Patient
  questionnaire: ClinicalQuestionnaire
  onRiskFactorUpdate: (assessmentId: string, assessment: RiskFactorAssessmentType) => void
}

const RiskFactorAssessment: React.FC<RiskFactorAssessmentProps> = ({
  patient,
  questionnaire,
  onRiskFactorUpdate
}) => {
  const [expandedAssessments, setExpandedAssessments] = useState<Set<string>>(new Set())
  const [progressUpdates, setProgressUpdates] = useState<Record<string, string>>({})

  // Generate risk assessments based on patient data
  const riskAssessments = useMemo<RiskFactorAssessmentType[]>(() => {
    const assessments: RiskFactorAssessmentType[] = []
    const lifestyle = questionnaire.subjective_template.lifestyle_factors
    const patientAge = patient.age || 0

    // Smoking Risk Assessment
    if (lifestyle.smoking_status !== 'never') {
      const dailyCigarettes = lifestyle.cigarettes_per_day || 0
      const smokingYears = lifestyle.smoking_duration_years || 0
      const packYears = (dailyCigarettes / 20) * smokingYears

      let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low'
      if (lifestyle.smoking_status === 'current') {
        if (packYears > 30 || dailyCigarettes > 20) riskLevel = 'critical'
        else if (packYears > 20 || dailyCigarettes > 10) riskLevel = 'high'
        else if (packYears > 10) riskLevel = 'moderate'
        else riskLevel = 'low'
      } else if (lifestyle.smoking_status === 'former') {
        riskLevel = packYears > 20 ? 'moderate' : 'low'
      }

      assessments.push({
        assessment_id: 'smoking_risk',
        category: 'smoking',
        current_status: lifestyle.smoking_status === 'current' 
          ? `Current smoker: ${dailyCigarettes} cigarettes/day (${packYears} pack-years)`
          : lifestyle.smoking_status === 'former' 
            ? `Former smoker: ${packYears} pack-years exposure`
            : 'Never smoked',
        risk_level: riskLevel,
        improvement_opportunities: lifestyle.smoking_status === 'current' 
          ? [
              'Smoking cessation counseling',
              'Nicotine replacement therapy consideration',
              'Behavioral support programs',
              'Regular follow-up for cessation support'
            ]
          : lifestyle.smoking_status === 'former'
            ? [
                'Continue smoking cessation',
                'Monitor for relapse risk factors',
                'Celebrate cessation success'
              ]
            : [],
        specific_recommendations: lifestyle.smoking_status === 'current'
          ? [
              'Set quit date within 2 weeks',
              'Consider pharmacological aids (varenicline, bupropion)',
              'Identify and avoid smoking triggers',
              'Join smoking cessation support group'
            ]
          : [],
        monitoring_frequency: lifestyle.smoking_status === 'current' ? 'weekly' : 'quarterly',
        target_goals: lifestyle.smoking_status === 'current' 
          ? ['Complete smoking cessation within 3 months', 'Reduce daily cigarettes by 50% within 1 month']
          : ['Maintain smoking cessation'],
        progress_indicators: [
          'Number of cigarettes per day',
          'Quit attempts in past year',
          'Motivation level (1-10 scale)',
          'Withdrawal symptoms management'
        ]
      })
    }

    // Diet and Exercise Risk Assessment
    const exerciseRisk = lifestyle.exercise_frequency === 'none' ? 'high' : 
                        lifestyle.exercise_frequency === 'rare' ? 'moderate' : 'low'

    assessments.push({
      assessment_id: 'lifestyle_risk',
      category: 'exercise',
      current_status: `Exercise: ${lifestyle.exercise_frequency}, Diet modifications: ${lifestyle.diet_modifications}`,
      risk_level: exerciseRisk,
      improvement_opportunities: [
        'Increase physical activity frequency',
        'Structured exercise program',
        'Nutritional counseling',
        'Weight management if indicated'
      ],
      specific_recommendations: [
        'Start with 150 minutes moderate activity per week',
        'Include strength training 2x per week',
        'Mediterranean-style diet consideration',
        'Regular meal timing and portion control'
      ],
      monitoring_frequency: 'monthly',
      target_goals: [
        'Exercise 150 minutes per week',
        'Maintain healthy weight (BMI 18.5-24.9)',
        'Improve cardiovascular fitness'
      ],
      progress_indicators: [
        'Weekly exercise minutes',
        'Weight stability',
        'Energy levels',
        'Sleep quality'
      ]
    })

    // Medication Compliance Risk
    const medicationCompliance = questionnaire.subjective_template.medication_compliance
    const nonCompliantMeds = medicationCompliance.filter(med => med.actual_compliance !== 'compliant').length
    const totalMeds = medicationCompliance.length

    if (totalMeds > 0) {
      const complianceRate = ((totalMeds - nonCompliantMeds) / totalMeds) * 100
      const complianceRisk: 'low' | 'moderate' | 'high' | 'critical' = 
        complianceRate >= 90 ? 'low' :
        complianceRate >= 80 ? 'moderate' :
        complianceRate >= 60 ? 'high' : 'critical'

      assessments.push({
        assessment_id: 'compliance_risk',
        category: 'compliance',
        current_status: `${Math.round(complianceRate)}% medication compliance (${totalMeds - nonCompliantMeds}/${totalMeds} medications)`,
        risk_level: complianceRisk,
        improvement_opportunities: [
          'Medication adherence counseling',
          'Simplify dosing regimens',
          'Address side effect concerns',
          'Use of medication organizers/reminders'
        ],
        specific_recommendations: [
          'Pill organizers for complex regimens',
          'Smartphone medication reminder apps',
          'Regular pharmacy consultation',
          'Address barriers to adherence'
        ],
        monitoring_frequency: 'monthly',
        target_goals: [
          'Achieve >90% medication adherence',
          'Reduce missed doses to <1 per week',
          'Address all medication concerns'
        ],
        progress_indicators: [
          'Missed doses per week',
          'Pharmacy refill compliance',
          'Patient-reported adherence score',
          'Clinical markers of medication effectiveness'
        ]
      })
    }

    // Self-Monitoring Risk (for diabetes/hypertension patients)
    const hasDiabetes = questionnaire.template_type === 'diabetes'
    const hasHypertension = questionnaire.template_type === 'cardiovascular'

    if (hasDiabetes || hasHypertension) {
      assessments.push({
        assessment_id: 'monitoring_risk',
        category: 'monitoring',
        current_status: hasDiabetes 
          ? 'SMBG (Self-monitoring blood glucose) required'
          : 'HMBP (Home blood pressure monitoring) required',
        risk_level: 'moderate', // Default, can be customized based on actual monitoring data
        improvement_opportunities: [
          'Regular self-monitoring compliance',
          'Proper technique education',
          'Record keeping improvement',
          'Technology integration (apps, devices)'
        ],
        specific_recommendations: hasDiabetes ? [
          'SMBG 2-4 times daily initially',
          'HbA1c monitoring every 3 months',
          'Glucose log maintenance',
          'Recognition of hypo/hyperglycemic symptoms'
        ] : [
          'HMBP daily at same time',
          'Proper cuff size and technique',
          'Blood pressure log maintenance',
          'Recognition of hypertensive symptoms'
        ],
        monitoring_frequency: 'weekly',
        target_goals: hasDiabetes ? [
          'HbA1c <7% (individualized)',
          'Fasting glucose 80-130 mg/dL',
          'Post-meal glucose <180 mg/dL'
        ] : [
          'Blood pressure <140/90 mmHg',
          'Home readings <135/85 mmHg',
          'Consistent daily monitoring'
        ],
        progress_indicators: [
          'Frequency of self-monitoring',
          'Quality of recorded data',
          'Trend recognition ability',
          'Action taken on abnormal readings'
        ]
      })
    }

    return assessments.sort((a, b) => {
      const riskWeight = { critical: 4, high: 3, moderate: 2, low: 1 }
      return riskWeight[b.risk_level] - riskWeight[a.risk_level]
    })
  }, [patient, questionnaire])

  const toggleAssessmentExpansion = (assessmentId: string) => {
    const newExpanded = new Set(expandedAssessments)
    if (newExpanded.has(assessmentId)) {
      newExpanded.delete(assessmentId)
    } else {
      newExpanded.add(assessmentId)
    }
    setExpandedAssessments(newExpanded)
  }

  const getRiskColor = (level: string) => {
    const colorMap = {
      critical: 'border-red-400/30 bg-red-500/10 text-red-200',
      high: 'border-orange-400/30 bg-orange-500/10 text-orange-200',
      moderate: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200',
      low: 'border-green-400/30 bg-green-500/10 text-green-200'
    }
    return colorMap[level as keyof typeof colorMap] || colorMap.moderate
  }

  const getRiskIcon = (level: string) => {
    const iconMap = {
      critical: AlertTriangle,
      high: XCircle,
      moderate: Clock,
      low: CheckCircle
    }
    const Icon = iconMap[level as keyof typeof iconMap] || Clock
    return <Icon className="w-4 h-4" />
  }

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      smoking: Cigarette,
      diet: Scale,
      exercise: Activity,
      monitoring: BarChart3,
      compliance: Heart
    }
    const Icon = iconMap[category as keyof typeof iconMap] || Target
    return <Icon className="w-4 h-4" />
  }

  const getOverallRiskScore = () => {
    const riskWeights = { critical: 4, high: 3, moderate: 2, low: 1 }
    const totalWeight = riskAssessments.reduce((sum, assessment) => 
      sum + riskWeights[assessment.risk_level], 0
    )
    const maxWeight = riskAssessments.length * 4
    return maxWeight > 0 ? Math.round((1 - totalWeight / maxWeight) * 100) : 100
  }

  const overallScore = getOverallRiskScore()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-clinical-blue" />
          <h3 className="font-semibold text-white">Risk Factor Assessment</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-white/80">Health Score:</span>
          <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
            overallScore >= 80 ? 'bg-green-500/20 text-green-200' :
            overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-200' : 'bg-red-500/20 text-red-200'
          }`}>
            {overallScore}%
          </span>
        </div>
      </div>

      {/* Overall Risk Summary */}
      <div className="bg-white/5 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Risk Categories</span>
          <div className="flex items-center space-x-1">
            {overallScore >= 80 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-xs">
          {['critical', 'high', 'moderate', 'low'].map(level => {
            const count = riskAssessments.filter(a => a.risk_level === level).length
            const colors = {
              critical: 'bg-red-500/10 text-red-300',
              high: 'bg-orange-500/10 text-orange-300',
              moderate: 'bg-yellow-500/10 text-yellow-300',
              low: 'bg-green-500/10 text-green-300'
            }
            return (
              <div key={level} className={`text-center p-2 rounded ${colors[level as keyof typeof colors]}`}>
                <div className="font-semibold">{count}</div>
                <div className="capitalize">{level}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Risk Assessments */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {riskAssessments.length === 0 ? (
          <div className="text-center py-6 text-white/70">
            <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No risk factors identified</p>
          </div>
        ) : (
          riskAssessments.map((assessment) => (
            <div
              key={assessment.assessment_id}
              className={`border rounded-lg p-3 ${getRiskColor(assessment.risk_level)}`}
            >
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => toggleAssessmentExpansion(assessment.assessment_id)}
              >
                <div className="flex items-start space-x-2 flex-1">
                  {getCategoryIcon(assessment.category)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm capitalize">{assessment.category} Risk</span>
                      {getRiskIcon(assessment.risk_level)}
                      <span className="text-xs capitalize font-medium">{assessment.risk_level}</span>
                    </div>
                    <p className="text-xs text-white/80">{assessment.current_status}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Monitor: {assessment.monitoring_frequency}
                </div>
              </div>

              {expandedAssessments.has(assessment.assessment_id) && (
                <div className="mt-3 pt-3 border-t border-white/20 space-y-3">
                  {/* Improvement Opportunities */}
                  <div>
                    <h4 className="text-xs font-medium text-white/90 mb-2">Improvement Opportunities:</h4>
                    <ul className="text-xs text-white/80 list-disc list-inside space-y-1">
                      {assessment.improvement_opportunities.map((opportunity, index) => (
                        <li key={index}>{opportunity}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Specific Recommendations */}
                  {assessment.specific_recommendations.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-white/90 mb-2">Specific Recommendations:</h4>
                      <ul className="text-xs text-white/80 list-disc list-inside space-y-1">
                        {assessment.specific_recommendations.map((recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Target Goals */}
                  <div>
                    <h4 className="text-xs font-medium text-white/90 mb-2">Target Goals:</h4>
                    <div className="space-y-1">
                      {assessment.target_goals.map((goal, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <Target className="w-3 h-3 text-gray-400" />
                          <span className="text-white/80">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Indicators */}
                  <div>
                    <h4 className="text-xs font-medium text-white/90 mb-2">Progress Indicators:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {assessment.progress_indicators.map((indicator, index) => (
                        <div key={index} className="text-xs bg-white/10 text-white/80 rounded p-1">
                          {indicator}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Update */}
                  <div className="mt-3 pt-2 border-t border-white/20">
                    <textarea
                      placeholder="Record progress notes or updates..."
                      value={progressUpdates[assessment.assessment_id] || ''}
                      onChange={(e) => setProgressUpdates(prev => ({
                        ...prev,
                        [assessment.assessment_id]: e.target.value
                      }))}
                      className="w-full text-xs bg-white/10 text-white placeholder:text-white/50 border border-white/30 rounded p-2 resize-none focus:border-white/50 focus:outline-none"
                      rows={2}
                    />
                    <button
                      onClick={() => {
                        onRiskFactorUpdate(assessment.assessment_id, {
                          ...assessment,
                          progress_indicators: [
                            ...assessment.progress_indicators,
                            progressUpdates[assessment.assessment_id] || ''
                          ].filter(Boolean)
                        })
                        setProgressUpdates(prev => ({ ...prev, [assessment.assessment_id]: '' }))
                      }}
                      disabled={!progressUpdates[assessment.assessment_id]?.trim()}
                      className="mt-2 text-xs bg-clinical-blue text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Update Progress
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RiskFactorAssessment