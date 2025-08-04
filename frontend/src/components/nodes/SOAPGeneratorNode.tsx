import React, { useState, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import { FileText, Sparkles, Save, Edit3, Calendar, User } from 'lucide-react'
import type { CanvasNodeProps, SOAPGeneratorNodeData, SOAPNote, SOAPSection } from '../../types'
import { createSOAPNoteHandlers } from '../../hooks/useSOAPNotes'

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
  const [editedSections, setEditedSections] = useState<SOAPSection>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  })

  const handleGenerate = useCallback(async () => {
    try {
      const generatedNote = await onGenerate(patient.id)
      setCurrentNote(generatedNote)
      setEditedSections(generatedNote.soap_sections)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to generate SOAP note:', error)
    }
  }, [patient.id, onGenerate])

  const handleSave = useCallback(async () => {
    if (!currentNote) return
    
    const updatedNote: SOAPNote = {
      ...currentNote,
      soap_sections: editedSections,
      last_modified: new Date().toISOString(),
      generated_by: isEditing ? 'manual' : currentNote.generated_by
    }
    
    try {
      await onSave(updatedNote)
      setCurrentNote(updatedNote)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save SOAP note:', error)
    }
  }, [currentNote, editedSections, isEditing, onSave])

  const handleSectionEdit = useCallback((section: keyof SOAPSection, value: string) => {
    setEditedSections(prev => ({
      ...prev,
      [section]: value
    }))
  }, [])

  const renderSOAPSection = (title: string, key: keyof SOAPSection, content: string) => (
    <div className="mb-4">
      <h4 className="font-medium text-gray-800 mb-2 flex items-center">
        <span className="w-6 h-6 rounded-full bg-clinical-blue text-white text-xs flex items-center justify-center mr-2">
          {title[0]}
        </span>
        {title}
      </h4>
      {isEditing ? (
        <textarea
          value={editedSections[key]}
          onChange={(e) => handleSectionEdit(key, e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-clinical-blue focus:border-transparent"
          rows={3}
          placeholder={`Enter ${title.toLowerCase()} information...`}
        />
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md">
          {content || `No ${title.toLowerCase()} information available`}
        </p>
      )}
    </div>
  )

  return (
    <div className="canvas-node min-w-[400px] max-w-[500px]">
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

      {/* Generated SOAP Note */}
      {currentNote ? (
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

          {/* SOAP Sections */}
          <div className="max-h-96 overflow-y-auto">
            {renderSOAPSection('Subjective', 'subjective', editedSections.subjective)}
            {renderSOAPSection('Objective', 'objective', editedSections.objective)}
            {renderSOAPSection('Assessment', 'assessment', editedSections.assessment)}
            {renderSOAPSection('Plan', 'plan', editedSections.plan)}
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
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm mb-2">No SOAP note generated yet</p>
          <p className="text-xs text-gray-400">
            Click "Generate" to create an AI-powered SOAP note based on patient data
          </p>
        </div>
      )}

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