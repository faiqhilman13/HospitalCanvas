import React, { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  ConnectionMode,
  Panel,
} from '@xyflow/react'
import type {
  Connection,
  Edge,
  Node,
  NodeTypes,
  DefaultEdgeOptions,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { User, Activity, AlertTriangle } from 'lucide-react'

import { useCanvasStore } from '../stores/canvasStore'
import { usePatientData } from '../hooks/usePatientData'
import { apiClient } from '../config/api'
import type { ClinicalCanvasProps, CanvasNode, PatientData } from '../types'

// Import custom node components
import PatientSummaryNode from './nodes/PatientSummaryNode'
import VitalsChartNode from './nodes/VitalsChartNode'
import DocumentViewerNode from './nodes/DocumentViewerNode'
import AIQuestionBoxNode from './nodes/AIQuestionBoxNode'
import LabResultsNode from './nodes/LabResultsNode'
import SOAPGeneratorNode from './nodes/SOAPGeneratorNode'
import PatientTimelineNode from './nodes/PatientTimelineNode'
import AnalyticsReportNode from './nodes/AnalyticsReportNode'
import SystemAdminNode from './nodes/SystemAdminNode'

// Define custom node types
const nodeTypes: NodeTypes = {
  patientSummary: PatientSummaryNode,
  vitalsChart: VitalsChartNode,
  documentViewer: DocumentViewerNode,
  aiQuestionBox: AIQuestionBoxNode,
  labResults: LabResultsNode,
  SOAPGenerator: SOAPGeneratorNode,
  Timeline: PatientTimelineNode,
  analyticsReport: AnalyticsReportNode,
  systemAdmin: SystemAdminNode,
}

// Enhanced edge styling options
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 2,
  },
  markerEnd: {
    type: 'arrowclosed' as any,
    width: 15,
    height: 15,
    color: '#3b82f6',
  },
}

// Helper function to create properly hydrated node data
const createNodeData = (nodeType: string, storedData: any, patientData: PatientData | null): any => {
  if (!patientData) return storedData; // Return minimal data if still loading
  
  switch (nodeType) {
    case 'SOAPGenerator':
      return {
        patient: patientData.patient,
        clinical_data: patientData.clinical_data || { vitals: [], labs: [] }
      };
    case 'Timeline':
      // Generate timeline events from patient data with null safety
      const vitals = patientData.clinical_data?.vitals || [];
      const labs = patientData.clinical_data?.labs || [];
      
      const events = [
        ...vitals.flatMap(vital => 
          vital.values.map(value => ({
            id: `vital-${vital.name}-${value.date}`,
            date: value.date,
            type: 'vital' as const,
            title: `${vital.name}: ${value.value} ${value.unit}`,
            description: `Recorded ${vital.name}`,
            urgency: value.flag === 'critical' ? 'critical' as const : 'low' as const
          }))
        ),
        ...labs.flatMap(category =>
          category.tests.map(test => ({
            id: `lab-${test.name}-${test.date}`,
            date: test.date,
            type: 'lab' as const,
            title: `${test.name}: ${test.value} ${test.unit}`,
            description: `Lab result in ${category.category}`,
            urgency: test.flag === 'critical' ? 'critical' as const : 'low' as const
          }))
        )
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return {
        events,
        patient: patientData.patient
      };
    case 'patientSummary':
      return {
        summary: patientData.summary,
        patient: patientData.patient
      };
    case 'vitalsChart':
      return {
        vitals: patientData.clinical_data?.vitals || [],
        title: 'Patient Vitals'
      };
    case 'documentViewer':
      return {
        document: patientData.documents?.[0] || null
      };
    case 'aiQuestionBox':
      return {
        qa_pairs: patientData.qa_pairs || [],
        onAsk: async (question: string) => {
          const result = await apiClient.post<any>(`/patients/${patientData.patient.id}/ask`, { question });
          
          if (!result.success || !result.data) {
            throw new Error(result.error?.message || 'Failed to get AI response');
          }
          
          const data = result.data;
          
          // Transform backend QAResponse to frontend QAPair format
          return {
            id: `qa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            question,
            answer: data.answer,
            confidence: data.confidence_score,
            source: {
              document_id: data.source_document || 'unknown',
              page: data.source_page || 1,
              text: 'Reference text from clinical document...'
            }
          };
        }
      };
    case 'labResults':
      return {
        labs: patientData.clinical_data?.labs || []
      };
    case 'analyticsReport':
      return {
        title: storedData?.title || 'Population Analytics',
        role: storedData?.role || 'analyst'
      };
    case 'systemAdmin':
      return storedData || {};
    default:
      return storedData;
  }
}

// Convert our custom canvas nodes to react-flow nodes with proper data hydration
const convertToReactFlowNodes = (canvasNodes: CanvasNode[], patientData: PatientData | null): Node[] => {
  return canvasNodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: createNodeData(node.type, node.data, patientData),
    style: {
      width: node.size?.width || 300,
      height: node.size?.height || 200,
    },
  }))
}

const ClinicalCanvas: React.FC<ClinicalCanvasProps> = ({ patientId }) => {
  const { 
    patientData, 
    currentRole,
    nodes: canvasNodes, 
    connections,
    viewport,
    setPatientData,
    updateNodePosition,
    updateViewport 
  } = useCanvasStore()

  const { data: patientApiData, isLoading, error } = usePatientData(patientId, currentRole)

  // Convert canvas nodes to react-flow format
  const reactFlowNodes = convertToReactFlowNodes(canvasNodes, patientData)
  const reactFlowEdges: Edge[] = connections.map(conn => ({
    id: conn.id,
    source: conn.source,
    target: conn.target,
    type: conn.type || 'default',
  }))

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges)

  // Update react-flow nodes when canvas nodes change
  useEffect(() => {
    const newNodes = convertToReactFlowNodes(canvasNodes, patientData)
    setNodes(newNodes)
  }, [canvasNodes, patientData, setNodes])

  // Load patient data when it becomes available
  useEffect(() => {
    if (patientApiData && Object.keys(patientApiData).length > 0) {
      setPatientData(patientApiData)
    }
  }, [patientApiData, setPatientData])

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges]
  )

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateNodePosition(node.id, node.position)
    },
    [updateNodePosition]
  )

  const onViewportChange = useCallback(
    (newViewport: { x: number; y: number; zoom: number }) => {
      updateViewport(newViewport)
    },
    [updateViewport]
  )

  // Enhanced Loading state with skeleton
  if (isLoading) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        {/* Background with subtle animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-purple-900/10 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center space-y-6 glass-panel p-8 animate-scale-in">
            {/* Advanced Loading Animation */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping opacity-75"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Activity className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Loading Clinical Canvas</h3>
              <p className="text-white/70 text-sm">Preparing patient data and AI insights...</p>
            </div>
            
            {/* Progress indicators */}
            <div className="flex space-x-2 justify-center">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center glass-panel p-8 animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Unable to Load Patient Data</h3>
          <p className="text-white/70 mb-4">{error.message}</p>
          <button className="clinical-button clinical-button-primary">
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  // Enhanced No patient data state
  if (!patientData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center glass-panel p-8 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Welcome to Clinical Canvas</h3>
          <p className="text-white/70">Select a patient to begin your clinical workflow</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onViewportChange={onViewportChange}
        nodeTypes={nodeTypes}
        defaultViewport={viewport}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        attributionPosition="bottom-left"
        minZoom={0.1}
        maxZoom={4}
        snapToGrid
        snapGrid={[15, 15]}
        fitView
        fitViewOptions={{
          padding: 0.1,
          includeHiddenNodes: false,
        }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        deleteKeyCode={['Delete', 'Backspace']}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={25} 
          size={2}
          color="rgba(255, 255, 255, 0.1)"
          style={{
            background: 'transparent'
          }}
        />
        
        {/* Enhanced Controls with Glass-morphism */}
        <Controls 
          className="border border-white/30 shadow-xl"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '8px'
          }}
        />
        
        {/* Enhanced MiniMap with Glass-morphism */}
        <MiniMap 
          className="border border-white/30 shadow-xl rounded-2xl overflow-hidden"
          nodeColor={(node) => {
            if (node.type === 'patientSummary') return '#3b82f6'
            if (node.type === 'vitalsChart') return '#10b981'
            if (node.type === 'Timeline') return '#8b5cf6'
            return '#6b7280'
          }}
          maskColor="rgba(0, 0, 0, 0.3)"
          nodeStrokeWidth={3}
          pannable={true}
          zoomable={true}
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)'
          }}
        />
        
        {/* Enhanced Help Panel */}
        <Panel 
          position="top-right" 
          className="border border-white/30 shadow-xl p-3 animate-fade-in rounded-2xl"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div className="text-sm text-white space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-white">Clinical Canvas</span>
            </div>
            <div className="space-y-1 text-xs text-white/90">
              <div>🔧 <strong className="text-white">Drag</strong> to move nodes</div>
              <div>📏 <strong className="text-white">Corners</strong> to resize</div>
              <div>🔗 <strong className="text-white">Handles</strong> to connect</div>
              <div>⚡ <strong className="text-white">Scroll</strong> to zoom</div>
            </div>
          </div>
        </Panel>
        
        {/* Enhanced Status Panel */}
        <Panel 
          position="bottom-left" 
          className="border border-white/30 shadow-xl p-3 animate-slide-in-right rounded-2xl"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div className="flex items-center space-x-3 text-sm text-white">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white">Live Canvas</span>
            </div>
            <div className="text-white/60">•</div>
            <div className="text-white/90">
              {nodes.length} nodes • {edges.length} connections
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default ClinicalCanvas