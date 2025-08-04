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
} from '@xyflow/react'
import type {
  Connection,
  Edge,
  Node,
  NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCanvasStore } from '../stores/canvasStore'
import { usePatientData } from '../hooks/usePatientData'
import type { ClinicalCanvasProps, CanvasNode as CustomCanvasNode } from '../types'

// Import custom node components
import PatientSummaryNode from './nodes/PatientSummaryNode'
import VitalsChartNode from './nodes/VitalsChartNode'
import DocumentViewerNode from './nodes/DocumentViewerNode'
import AIQuestionBoxNode from './nodes/AIQuestionBoxNode'
import LabResultsNode from './nodes/LabResultsNode'

// Define custom node types
const nodeTypes: NodeTypes = {
  PatientSummary: PatientSummaryNode,
  VitalsChart: VitalsChartNode,
  DocumentViewer: DocumentViewerNode,
  AIQuestionBox: AIQuestionBoxNode,
  LabResults: LabResultsNode,
}

// Convert our custom canvas nodes to react-flow nodes
const convertToReactFlowNodes = (canvasNodes: CustomCanvasNode[]): Node[] => {
  return canvasNodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
    style: {
      width: node.size.width,
      height: node.size.height,
    },
  }))
}

const ClinicalCanvas: React.FC<ClinicalCanvasProps> = ({ patientId }) => {
  const { 
    patientData, 
    nodes: canvasNodes, 
    connections,
    viewport,
    setPatientData,
    updateNodePosition,
    updateViewport 
  } = useCanvasStore()

  const { data: patientApiData, isLoading, error } = usePatientData(patientId)

  // Convert canvas nodes to react-flow format
  const reactFlowNodes = convertToReactFlowNodes(canvasNodes)
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
    const newNodes = convertToReactFlowNodes(canvasNodes)
    setNodes(newNodes)
  }, [canvasNodes, setNodes])

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
        attributionPosition="bottom-left"
        minZoom={0.2}
        maxZoom={2}
        snapToGrid
        snapGrid={[10, 10]}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#e5e7eb"
        />
        <Controls 
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        />
        <MiniMap 
          className="bg-gray-100 border border-gray-200 rounded-lg"
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  )
}

export default ClinicalCanvas