import React, { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { FileText, ZoomIn, ZoomOut, Search, Download } from 'lucide-react'
import type { CanvasNodeProps, DocumentViewerNodeData } from '../../types'

const DocumentViewerNode: React.FC<CanvasNodeProps> = ({ data }) => {
  const { document, highlightedText, highlightedPage } = data as DocumentViewerNodeData
  const [currentPage, setCurrentPage] = useState(highlightedPage || 1)
  const [zoomLevel, setZoomLevel] = useState(100)

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, document.pages)))
  }

  return (
    <div className="canvas-node min-w-[350px] min-h-[400px] flex flex-col">
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

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default DocumentViewerNode