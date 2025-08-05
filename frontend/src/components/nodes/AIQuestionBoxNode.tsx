import React, { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { MessageCircle, Send, Brain, ExternalLink } from 'lucide-react'
import type { CanvasNodeProps, AIQuestionBoxNodeData, QAPair } from '../../types'

const AIQuestionBoxNode: React.FC<CanvasNodeProps> = ({ data }) => {
  const { qa_pairs, onAsk } = data as AIQuestionBoxNodeData
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState<QAPair[]>(qa_pairs || [])

  const handleAsk = async () => {
    if (!question.trim() || isLoading || !onAsk) return

    setIsLoading(true)
    try {
      const response = await onAsk(question.trim())
      setConversations(prev => [...prev, response])
      setQuestion('')
    } catch (error) {
      console.error('Error asking question:', error)
      // Show user-friendly error message
      const errorResponse: QAPair = {
        id: `qa-error-${Date.now()}`,
        question: question.trim(),
        answer: "I apologize, but I encountered an error while processing your question. Please try again or contact support if the problem persists.",
        confidence: 0.0,
        source: {
          document_id: 'error',
          page: 0,
          text: 'Error occurred during processing'
        }
      }
      setConversations(prev => [...prev, errorResponse])
      setQuestion('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  const handleViewSource = (qa: QAPair) => {
    // In a real implementation, this would highlight the source in the document viewer
    console.log('View source:', qa.source)
    // Could dispatch an event or use a callback to highlight text in DocumentViewer
  }

  return (
    <div className="canvas-node min-w-[400px] min-h-[300px] flex flex-col">
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3 flex-shrink-0">
        <Brain className="w-5 h-5 text-clinical-blue" />
        <h3 className="font-semibold text-gray-900">Ask AI</h3>
        <div className="text-xs text-gray-500">
          Clinical Document Q&A
        </div>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-auto mb-3 space-y-3 min-h-0">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm">Ask a question about this patient's clinical data</p>
          </div>
        ) : (
          conversations.map((qa) => (
            <div key={qa.id} className="space-y-2">
              {/* Question */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 font-medium">Q: {qa.question}</p>
              </div>
              
              {/* Answer */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-800 mb-2">{qa.answer}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Confidence: {Math.round(qa.confidence * 100)}%</span>
                    {qa.source && (
                      <button
                        onClick={() => handleViewSource(qa)}
                        className="flex items-center space-x-1 text-clinical-blue hover:text-blue-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Source (Page {qa.source.page})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Question Input */}
      <div className="flex-shrink-0 border-t border-gray-200 pt-3">
        <div className="flex space-x-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this patient..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinical-blue focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || isLoading || !onAsk}
            className="px-3 py-2 bg-clinical-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default AIQuestionBoxNode