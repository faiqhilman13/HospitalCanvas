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

import { useCanvasStore } from '../stores/canvasStore'
import { usePatientData } from '../hooks/usePatientData'
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
    type: 'arrowclosed',
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
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
          const response = await fetch(`${API_BASE_URL}/patients/${patientData.patient.id}/ask`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question })
          });
          
          if (!response.ok) {
            throw new Error('Failed to get AI response');
          }
          
          const data = await response.json();
          
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

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinical-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading patient data</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  // No patient data state
  if (!patientData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Select a patient to view their clinical canvas</p>
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
          gap={20} 
          size={1}
          color="#e5e7eb"
        />
        <Controls 
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        <MiniMap 
          className="bg-gray-100 border border-gray-200 rounded-lg"
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.1)"
          nodeStrokeWidth={2}
          pannable={true}
          zoomable={true}
        />
        <Panel position="top-right" className="bg-white border border-gray-200 rounded-lg shadow-sm p-2">
          <div className="text-xs text-gray-600 space-y-1">
            <div>🔧 <strong>Drag</strong> to move nodes</div>
            <div>📏 <strong>Drag corners</strong> to resize</div>
            <div>🔗 <strong>Drag handles</strong> to connect</div>
            <div>⚡ <strong>Scroll</strong> to zoom</div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default ClinicalCanvas