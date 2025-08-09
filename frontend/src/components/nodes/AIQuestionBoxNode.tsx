import React, { useState } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
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
      <NodeResizer
        minWidth={300}
        minHeight={200}
        maxWidth={600}
        maxHeight={500}
        shouldResize={() => true}
        handleStyle={{
          backgroundColor: '#06b6d4',
          width: '8px',
          height: '8px',
          border: '2px solid white'
        }}
        lineStyle={{
          borderColor: '#06b6d4',
          borderWidth: '2px'
        }}
      />
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3 flex-shrink-0">
        <Brain className="w-5 h-5 text-white" />
        <h3 className="font-semibold text-white">Ask AI</h3>
        <div className="text-xs text-white/70">
          Clinical Document Q&A
        </div>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-auto mb-3 space-y-3 min-h-0">
        {conversations.length === 0 ? (
          <div className="text-center text-white/70 py-8">
            <MessageCircle className="w-8 h-8 text-white/50 mx-auto mb-2" />
            <p className="text-sm">Ask a question about this patient's clinical data</p>
          </div>
        ) : (
          conversations.map((qa) => (
            <div key={qa.id} className="space-y-2">
              {/* Question */}
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                <p className="text-sm text-blue-300 font-medium">Q: {qa.question}</p>
              </div>
              
              {/* Answer */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-sm text-white/90 mb-2">{qa.answer}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60">Confidence: {Math.round(qa.confidence * 100)}%</span>
                    {qa.source && (
                      <button
                        onClick={() => handleViewSource(qa)}
                        className="flex items-center space-x-1 text-blue-300 hover:text-blue-200"
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
      <div className="flex-shrink-0 border-t border-white/10 pt-3">
        <div className="flex space-x-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this patient..."
            className="flex-1 resize-none border border-white/20 rounded-lg px-3 py-2 text-sm bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || isLoading || !onAsk}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="text-xs text-white/50 mt-1">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default AIQuestionBoxNode