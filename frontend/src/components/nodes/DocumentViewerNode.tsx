import React, { useState, useCallback, useRef } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import { FileText, ZoomIn, ZoomOut, Search, Download, Upload, Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { apiClient } from '../../config/api'
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
      <div className="canvas-node min-w-[400px] min-h-[350px] animate-fade-in">
        <Handle 
          type="target" 
          position={Position.Top}
          style={{
            backgroundColor: '#f59e0b',
            border: '2px solid white',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}
        />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText className="w-12 h-12 text-white/50 mx-auto mb-2" />
            <p className="text-white/80 font-medium">No document available</p>
            <p className="text-white/60 text-sm mt-1">Upload a document to view</p>
          </div>
        </div>
        <Handle 
          type="source" 
          position={Position.Bottom}
          style={{
            backgroundColor: '#8b5cf6',
            border: '2px solid white',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}
        />
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
    
    // For file uploads, we need to use a custom request without JSON content-type
    const config = apiClient.getConfig()
    const response = await fetch(`${config.baseUrl}/patients/${patientId}/documents/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }))
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
          width: '10px',
          height: '10px',
          border: '2px solid white',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
        }}
        lineStyle={{
          borderColor: '#ec4899',
          borderWidth: '2px',
          borderStyle: 'dashed'
        }}
      />
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          backgroundColor: '#f59e0b',
          border: '2px solid white',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
        }}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-white" />
          <div>
            <h3 className="font-semibold text-white text-sm">{document.filename}</h3>
            <p className="text-xs text-white/70">{document.type} • {document.pages} pages</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {allowUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="p-1.5 hover:bg-white/10 rounded text-white"
              title="Upload Document"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-white/10 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-white/70" />
          </button>
          <span className="text-xs text-white/70 min-w-[3rem] text-center">
            {zoomLevel}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-white/10 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Toolbar */}
          <div className="bg-white/10 border-b border-white/10 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-2 py-1 text-xs border border-white/20 rounded bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-white/70">
                Page {currentPage} of {document.pages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= document.pages}
                className="px-2 py-1 text-xs border border-white/20 rounded bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div className="flex items-center space-x-1">
              <button className="p-1 hover:bg-white/10 rounded" title="Search">
                <Search className="w-4 h-4 text-white/70" />
              </button>
              <button className="p-1 hover:bg-white/10 rounded" title="Download">
                <Download className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 p-4 overflow-auto">
            <div 
              className="bg-white/10 shadow-sm border border-white/20 rounded-lg min-h-full"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
            >
              {/* Mock PDF content */}
              <div className="p-6 text-sm">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-white">Medical Referral</h2>
                  <p className="text-white/80">Patient: {document.filename.replace('_', ' ').replace('.pdf', '')}</p>
                </div>
                
                {currentPage === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-white/90 mb-2">Patient Information</h3>
                      <p className="text-white/80">Name: Uncle Tan</p>
                      <p className="text-white/80">Age: 65 years</p>
                      <p className="text-white/80">Gender: Male</p>
                      <p className="text-white/80">DOB: March 15, 1959</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white/90 mb-2">Chief Complaint</h3>
                      <p className="text-white/80">
                        Progressive fatigue and decreased exercise tolerance over the past 6 months.
                        Recent lab work showing declining kidney function.
                      </p>
                    </div>
                  </div>
                )}
                
                {currentPage === 12 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-white/90 mb-2">Laboratory Results</h3>
                      <div className={`p-3 rounded-lg ${highlightedText ? 'bg-yellow-500/20 border-2 border-yellow-400/50' : 'bg-white/5'}`}>
                        <p className="text-white/80">
                          <strong className="text-white/90">eGFR:</strong> 48 mL/min/1.73m² (previous: 55 mL/min/1.73m² in April, 62 mL/min/1.73m² in January)
                        </p>
                        <p className="text-white/80">
                          <strong className="text-white/90">Creatinine:</strong> 1.4 mg/dL (elevated)
                        </p>
                        <p className="text-white/80">
                          <strong className="text-white/90">BUN:</strong> 28 mg/dL (elevated)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Default content for other pages */}
                {currentPage !== 1 && currentPage !== 12 && (
                  <div className="space-y-4">
                    <p className="text-white/80">
                      Page {currentPage} content would be displayed here in a real implementation.
                      This is a mock document viewer for demonstration purposes.
                    </p>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <p className="text-white/70 italic">
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
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 min-w-[300px] max-w-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white/70 hover:text-white"
                disabled={uploading}
              >
                ×
              </button>
            </div>

            {uploadStatus === 'idle' || uploadStatus === 'error' ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-white/50 mx-auto mb-2" />
                  <p className="text-sm text-white/80 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-white/60">
                    PDF, JPG, PNG, or TIFF files supported
                  </p>
                  <button
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
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
                <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-white/80">Processing document...</p>
                <p className="text-xs text-white/60">This may take a few moments</p>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-white font-medium">Upload Successful!</p>
                <p className="text-xs text-white/70">{uploadMessage}</p>
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

      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{
          backgroundColor: '#8b5cf6',
          border: '2px solid white',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
        }}
      />
    </div>
  )
}

export default DocumentViewerNode