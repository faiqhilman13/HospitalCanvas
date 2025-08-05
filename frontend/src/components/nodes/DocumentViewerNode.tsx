import React, { useState, useCallback, useRef } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import { FileText, ZoomIn, ZoomOut, Search, Download, Upload, Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { CanvasNodeProps, DocumentViewerNodeData } from '../../types'

interface EnhancedDocumentViewerNodeData extends DocumentViewerNodeData {
  patientId?: string
  onDocumentUpload?: (file: File) => Promise<void>
  allowUpload?: boolean
}

const DocumentViewerNode: React.FC<CanvasNodeProps> = ({ data }) => {
  const nodeData = data as EnhancedDocumentViewerNodeData
  
  // Handle both data structures: backend format and expected format
  let document: any
  
  if (nodeData.document) {
    // Expected format
    document = nodeData.document
  } else if (nodeData.documentName && nodeData.documentUrl) {
    // Backend format - convert to expected format
    document = {
      id: 'doc-1',
      filename: nodeData.documentName,
      type: nodeData.documentName.includes('referral') ? 'referral' : 'document',
      url: nodeData.documentUrl,
      pages: nodeData.pageCount || 1
    }
  } else {
    // Fallback - no valid document data
    console.warn('DocumentViewerNode: No valid document data provided', nodeData)
    return (
      <div className="canvas-node min-w-[400px] min-h-[350px]">
        <Handle type="target" position={Position.Top} />
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No document available</p>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    )
  }
  
  const { highlightedText, highlightedPage, patientId, onDocumentUpload, allowUpload = true } = nodeData
  
  const [currentPage, setCurrentPage] = useState(highlightedPage || 1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, document.pages)))
  }

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadStatus('idle')
    setUploadMessage('')

    try {
      // Call upload handler or API directly
      if (onDocumentUpload) {
        await onDocumentUpload(file)
      } else if (patientId) {
        await uploadDocumentToAPI(patientId, file)
      }
      
      setUploadStatus('success')
      setUploadMessage(`${file.name} uploaded successfully`)
      setTimeout(() => {
        setShowUploadModal(false)
        setUploadStatus('idle')
      }, 2000)
    } catch (error) {
      setUploadStatus('error')
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [onDocumentUpload, patientId])

  const uploadDocumentToAPI = async (patientId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`http://localhost:8000/api/patients/${patientId}/documents/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Upload failed')
    }

    return response.json()
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="canvas-node min-w-[350px] min-h-[400px] flex flex-col">
      <NodeResizer
        minWidth={400}
        minHeight={300}
        maxWidth={700}
        maxHeight={600}
        shouldResize={() => true}
        handleStyle={{
          backgroundColor: '#ec4899',
          width: '8px',
          height: '8px',
          border: '2px solid white'
        }}
        lineStyle={{
          borderColor: '#ec4899',
          borderWidth: '2px'
        }}
      />
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-clinical-blue" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{document.filename}</h3>
            <p className="text-xs text-gray-600">{document.type} • {document.pages} pages</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {allowUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="p-1.5 hover:bg-gray-100 rounded text-clinical-blue"
              title="Upload Document"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-gray-100 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs text-gray-600 min-w-[3rem] text-center">
            {zoomLevel}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-gray-100 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-gray-600">
                Page {currentPage} of {document.pages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= document.pages}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div className="flex items-center space-x-1">
              <button className="p-1 hover:bg-gray-100 rounded" title="Search">
                <Search className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" title="Download">
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 p-4 overflow-auto">
            <div 
              className="bg-white shadow-sm border border-gray-200 rounded-lg min-h-full"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
            >
              {/* Mock PDF content */}
              <div className="p-6 text-sm">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Medical Referral</h2>
                  <p className="text-gray-600">Patient: {document.filename.replace('_', ' ').replace('.pdf', '')}</p>
                </div>
                
                {currentPage === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Patient Information</h3>
                      <p className="text-gray-700">Name: Uncle Tan</p>
                      <p className="text-gray-700">Age: 65 years</p>
                      <p className="text-gray-700">Gender: Male</p>
                      <p className="text-gray-700">DOB: March 15, 1959</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Chief Complaint</h3>
                      <p className="text-gray-700">
                        Progressive fatigue and decreased exercise tolerance over the past 6 months.
                        Recent lab work showing declining kidney function.
                      </p>
                    </div>
                  </div>
                )}
                
                {currentPage === 12 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Laboratory Results</h3>
                      <div className={`p-3 rounded-lg ${highlightedText ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-gray-50'}`}>
                        <p className="text-gray-700">
                          <strong>eGFR:</strong> 48 mL/min/1.73m² (previous: 55 mL/min/1.73m² in April, 62 mL/min/1.73m² in January)
                        </p>
                        <p className="text-gray-700">
                          <strong>Creatinine:</strong> 1.4 mg/dL (elevated)
                        </p>
                        <p className="text-gray-700">
                          <strong>BUN:</strong> 28 mg/dL (elevated)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Default content for other pages */}
                {currentPage !== 1 && currentPage !== 12 && (
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Page {currentPage} content would be displayed here in a real implementation.
                      This is a mock document viewer for demonstration purposes.
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-gray-600 italic">
                        Mock content for page {currentPage} of the clinical document.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-lg p-6 min-w-[300px] max-w-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={uploading}
              >
                ×
              </button>
            </div>

            {uploadStatus === 'idle' || uploadStatus === 'error' ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG, or TIFF files supported
                  </p>
                  <button
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="mt-3 px-4 py-2 bg-clinical-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </button>
                </div>

                {uploadStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{uploadMessage}</span>
                  </div>
                )}
              </div>
            ) : uploading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-clinical-blue mx-auto mb-2 animate-spin" />
                <p className="text-sm text-gray-600">Processing document...</p>
                <p className="text-xs text-gray-500">This may take a few moments</p>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-900 font-medium">Upload Successful!</p>
                <p className="text-xs text-gray-600">{uploadMessage}</p>
              </div>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
              className="hidden"
            />
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default DocumentViewerNode