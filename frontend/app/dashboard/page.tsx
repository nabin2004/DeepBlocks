"use client"

import { useState, useCallback, useRef } from 'react'
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PanelRightClose, PanelRightOpen, CheckCircle, AlertCircle, Layers, Brain, Download, PlayCircle, Trash2, MousePointerClick } from "lucide-react"

const initialNodes = [
  { 
    id: 'n1', 
    position: { x: 0, y: 0 }, 
    data: { 
      label: 'Input Layer',
      layerName: 'input_layer',
      type: 'Input',
      units: 784,
      activation: 'None',
      totalParams: 0,
      estimatedMemory: '0.1 MB',
      status: 'Ready'
    } 
  },
  { 
    id: 'n2', 
    position: { x: 0, y: 150 }, 
    data: { 
      label: 'Dense Layer',
      layerName: 'dense_1',
      type: 'Dense',
      units: 64,
      activation: 'relu',
      totalParams: 50240,
      estimatedMemory: '0.2 MB',
      status: 'Ready'
    } 
  },
  { 
    id: 'n3', 
    position: { x: 0, y: 300 }, 
    data: { 
      label: 'Conv Layer',
      layerName: 'conv_1',
      type: 'Conv2D',
      units: 32,
      kernelSize: '3x3',
      activation: 'relu',
      totalParams: 320,
      estimatedMemory: '0.15 MB',
      status: 'Ready'
    } 
  },
]

const initialEdges = [
  { id: 'n1-n2', source: 'n1', target: 'n2' },
  { id: 'n2-n3', source: 'n2', target: 'n3' }
]

export default function Page() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [selectedNode, setSelectedNode] = useState(initialNodes[1])
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [isTraining, setIsTraining] = useState(false)
  const nodeIdCounter = useRef(4) // Start from 4 since we have 3 initial nodes

  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  )
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  )
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  )

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
    setSelectedEdge(null)
    setIsRightSidebarOpen(true)
  }, [])

  // Handle edge click to select it
  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation()
    setSelectedEdge(edge)
    setSelectedNode(null)
  }, [])

  // Handle pane click to deselect everything
  const onPaneClick = useCallback(() => {
    setSelectedEdge(null)
    setSelectedNode(null)
  }, [])

  // Delete selected edge
  const handleDeleteEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges(edges => edges.filter(edge => edge.id !== selectedEdge.id))
      setSelectedEdge(null)
    }
  }, [selectedEdge])

  // Delete selected node
  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      // Also delete connected edges
      setEdges(edges => edges.filter(edge => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ))
      setNodes(nds => nds.filter(node => node.id !== selectedNode.id))
      setSelectedNode(null)
      setIsRightSidebarOpen(false)
    }
  }, [selectedNode])

  // Function to add a new node when clicked from sidebar
  const handleAddNode = useCallback((nodeType: string, config: any) => {
    const newNodeId = `node-${nodeIdCounter.current++}`
    
    // Create a unique layer name based on type
    const layerCount = nodes.filter(n => n.data.type === nodeType).length
    const layerName = `${nodeType.toLowerCase()}_${layerCount + 1}`
    
    const newNode = {
      id: newNodeId,
      position: {
        x: Math.random() * 400, // Random position within 400px
        y: Math.random() * 400
      },
      data: {
        label: config.label || nodeType,
        layerName: layerName,
        type: nodeType,
        units: config.units || 32,
        activation: config.activation || 'relu',
        kernelSize: config.kernelSize || '3x3',
        rate: config.rate || 0.5,
        poolSize: config.poolSize || '2x2',
        totalParams: config.totalParams || 0,
        estimatedMemory: config.estimatedMemory || '0.1 MB',
        status: 'Ready'
      }
    }
    
    setNodes(nds => [...nds, newNode])
    setSelectedNode(newNode)
    setSelectedEdge(null)
    setIsRightSidebarOpen(true)
  }, [nodes])

  // Handle drop from drag and drop
  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      
      const reactFlowBounds = event.target.getBoundingClientRect()
      const nodeType = event.dataTransfer.getData('application/reactflow')
      const config = JSON.parse(event.dataTransfer.getData('application/json') || '{}')
      
      if (!nodeType) return
      
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      }
      
      const newNodeId = `node-${nodeIdCounter.current++}`
      const layerCount = nodes.filter(n => n.data.type === nodeType).length
      const layerName = `${nodeType.toLowerCase()}_${layerCount + 1}`
      
      const newNode = {
        id: newNodeId,
        position,
        data: {
          label: config.label || nodeType,
          layerName: layerName,
          type: nodeType,
          units: config.units || 32,
          activation: config.activation || 'relu',
          kernelSize: config.kernelSize || '3x3',
          rate: config.rate || 0.5,
          poolSize: config.poolSize || '2x2',
          totalParams: config.totalParams || 0,
          estimatedMemory: config.estimatedMemory || '0.1 MB',
          status: 'Ready'
        }
      }
      
      setNodes(nds => [...nds, newNode])
      setSelectedNode(newNode)
      setSelectedEdge(null)
      setIsRightSidebarOpen(true)
    },
    [nodes]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleTrainModel = useCallback(() => {
    setIsTraining(true)
    setTimeout(() => {
      setIsTraining(false)
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            status: 'Trained'
          }
        }))
      )
      if (selectedNode) {
        setSelectedNode(prev => ({
          ...prev,
          data: {
            ...prev.data,
            status: 'Trained'
          }
        }))
      }
      alert('Model training completed!')
    }, 2000)
  }, [selectedNode])

  const handleExportModel = useCallback(() => {
    const modelData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.data.type,
        layerName: node.data.layerName,
        units: node.data.units,
        activation: node.data.activation,
        kernelSize: node.data.kernelSize
      })),
      edges: edges.map(edge => ({
        source: edge.source,
        target: edge.target
      })),
      totalParameters: nodes.reduce((sum, node) => sum + (node.data.totalParams || 0), 0),
      totalLayers: nodes.length
    }
    
    const dataStr = JSON.stringify(modelData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deepblocks-model-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('Model exported successfully!')
  }, [nodes, edges])

  const handleParameterChange = useCallback((field, value) => {
    if (!selectedNode) return
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value,
            },
          }
        }
        return node
      })
    )
    
    setSelectedNode(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      }
    }))
  }, [selectedNode])

  const activationOptions = [
    { value: 'None', label: 'None' },
    { value: 'relu', label: 'ReLU' },
    { value: 'sigmoid', label: 'Sigmoid' },
    { value: 'tanh', label: 'Tanh' },
    { value: 'softmax', label: 'Softmax' },
    { value: 'leaky_relu', label: 'Leaky ReLU' },
  ]

  const kernelSizeOptions = [
    { value: '1x1', label: '1x1' },
    { value: '3x3', label: '3x3' },
    { value: '5x5', label: '5x5' },
    { value: '7x7', label: '7x7' },
  ]

  const layerTypeOptions = [
    { value: 'Input', label: 'Input' },
    { value: 'Dense', label: 'Dense' },
    { value: 'Conv2D', label: 'Conv2D' },
    { value: 'LSTM', label: 'LSTM' },
    { value: 'GRU', label: 'GRU' },
    { value: 'ReLU', label: 'ReLU' },
    { value: 'Sigmoid', label: 'Sigmoid' },
    { value: 'Tanh', label: 'Tanh' },
    { value: 'Softmax', label: 'Softmax' },
    { value: 'Dropout', label: 'Dropout' },
    { value: 'MaxPooling2D', label: 'Max Pooling 2D' },
    { value: 'AveragePooling2D', label: 'Average Pooling 2D' },
    { value: 'BatchNormalization', label: 'Batch Normalization' },
    { value: 'LayerNormalization', label: 'Layer Normalization' },
    { value: 'Flatten', label: 'Flatten' },
    { value: 'Add', label: 'Add' },
    { value: 'Concatenate', label: 'Concatenate' },
    { value: 'Output', label: 'Output' },
  ]

  return (
    <SidebarProvider>
      {/* Left Sidebar */}
      <AppSidebar onAddNode={handleAddNode} />
      
      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        <SidebarInset className="flex flex-col flex-1">
          {/* Header */}
          <header className="flex h-16 items-center gap-4 px-4 border-b border-border bg-background">
            <SidebarTrigger className="flex-shrink-0" />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DeepBlocks
                </span>
                <Separator orientation="vertical" className="h-6" />
              </div>
              
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportModel}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Model
              </Button>
              
              <Button
                size="sm"
                onClick={handleTrainModel}
                disabled={isTraining}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {isTraining ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Training...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Train Model
                  </>
                )}
              </Button>

              {/* Right Sidebar toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="gap-2"
              >
                {isRightSidebarOpen ? (
                  <>
                    <PanelRightClose className="h-4 w-4" />
                    Close Properties
                  </>
                ) : (
                  <>
                    <PanelRightOpen className="h-4 w-4" />
                    Open Properties
                  </>
                )}
              </Button>
            </div>
          </header>

          {/* Main content with ReactFlow */}
          <main className="flex-1 min-h-0 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              edgesFocusable={true}
              edgesUpdatable={true}
              edgesSelectable={true}
              fitView
              className="w-full h-full"
            >
              <Background color="#a6a6a6" variant={BackgroundVariant.Dots} gap={10} />
              
              {/* Custom edge style for selected edges */}
              <style>
                {`
                  .react-flow__edge.selected .react-flow__edge-path {
                    stroke: #ef4444 !important;
                    stroke-width: 3 !important;
                  }
                  .react-flow__edge.selected .react-flow__edge-interaction {
                    stroke: #ef4444 !important;
                  }
                `}
              </style>
              
              {/* Drop Zone Instructions */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 text-sm text-muted-foreground shadow-lg">
                <p className="flex items-center gap-2">
                  <span>💡</span>
                  <span>Click sidebar items to add nodes • Click arrows to delete them</span>
                </p>
              </div>

              {/* Edge deletion button (shown when an edge is selected) */}
              {selectedEdge && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Edge Selected</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteEdge}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Connection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEdge(null)}
                      className="gap-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </ReactFlow>
          </main>
        </SidebarInset>

        {/* Right Sidebar - Properties Panel */}
        {isRightSidebarOpen && selectedNode && (
          <div className="w-96 border-l border-border bg-background flex flex-col">
            {/* Right Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-sm">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Layer Properties</h3>
                  <p className="text-xs text-muted-foreground">DeepBlocks • Configure selected layer</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRightSidebarOpen(false)}
                className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>

            {/* Right Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                {/* Layer Name Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="layer-name" className="font-medium">Layer Name</Label>
                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300 rounded-md font-medium">
                      {selectedNode?.data?.type}
                    </span>
                  </div>
                  <Input
                    id="layer-name"
                    value={selectedNode?.data?.layerName || ''}
                    onChange={(e) => handleParameterChange('layerName', e.target.value)}
                    placeholder="Enter layer name"
                    className="font-mono border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Separator />

                {/* Parameters Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <h4 className="font-medium text-lg">Parameters</h4>
                  </div>
                  
                  {/* Layer Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="layer-type">Layer Type</Label>
                    <Select 
                      value={selectedNode?.data?.type || ''}
                      onValueChange={(value) => handleParameterChange('type', value)}
                    >
                      <SelectTrigger id="layer-type" className="border-blue-200 dark:border-blue-800">
                        <SelectValue placeholder="Select layer type" />
                      </SelectTrigger>
                      <SelectContent>
                        {layerTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${
                                option.value === 'Input' ? 'bg-green-500' :
                                option.value === 'Dense' ? 'bg-blue-500' :
                                option.value === 'Conv2D' ? 'bg-purple-500' :
                                'bg-gray-500'
                              }`}></div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Units/Neurons/Filters */}
                  {(selectedNode?.data?.type === 'Dense' || selectedNode?.data?.type === 'Conv2D' || 
                    selectedNode?.data?.type === 'LSTM' || selectedNode?.data?.type === 'GRU' ||
                    selectedNode?.data?.type === 'Input' || selectedNode?.data?.type === 'Output') && (
                    <div className="space-y-2">
                      <Label htmlFor="units">
                        {selectedNode?.data?.type === 'Conv2D' ? 'Filters' : 'Units/Neurons'}
                      </Label>
                      <Input
                        id="units"
                        type="number"
                        value={selectedNode?.data?.units || ''}
                        onChange={(e) => handleParameterChange('units', parseInt(e.target.value) || 0)}
                        placeholder="64"
                        className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Kernel Size (for Conv layers) */}
                  {selectedNode?.data?.type === 'Conv2D' && (
                    <div className="space-y-2">
                      <Label htmlFor="kernel-size">Kernel Size</Label>
                      <Select 
                        value={selectedNode?.data?.kernelSize || '3x3'}
                        onValueChange={(value) => handleParameterChange('kernelSize', value)}
                      >
                        <SelectTrigger id="kernel-size" className="border-blue-200 dark:border-blue-800">
                          <SelectValue placeholder="Select kernel size" />
                        </SelectTrigger>
                        <SelectContent>
                          {kernelSizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Pool Size (for Pooling layers) */}
                  {(selectedNode?.data?.type === 'MaxPooling2D' || selectedNode?.data?.type === 'AveragePooling2D') && (
                    <div className="space-y-2">
                      <Label htmlFor="pool-size">Pool Size</Label>
                      <Input
                        id="pool-size"
                        value={selectedNode?.data?.poolSize || '2x2'}
                        onChange={(e) => handleParameterChange('poolSize', e.target.value)}
                        placeholder="2x2"
                        className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Dropout Rate */}
                  {selectedNode?.data?.type === 'Dropout' && (
                    <div className="space-y-2">
                      <Label htmlFor="dropout-rate">Dropout Rate</Label>
                      <Input
                        id="dropout-rate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={selectedNode?.data?.rate || 0.5}
                        onChange={(e) => handleParameterChange('rate', parseFloat(e.target.value))}
                        placeholder="0.5"
                        className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Activation Function */}
                  {(selectedNode?.data?.type === 'Dense' || selectedNode?.data?.type === 'Conv2D' ||
                    selectedNode?.data?.type === 'LSTM' || selectedNode?.data?.type === 'GRU' ||
                    selectedNode?.data?.type === 'Output') && (
                    <div className="space-y-2">
                      <Label htmlFor="activation">Activation</Label>
                      <Select 
                        value={selectedNode?.data?.activation || 'None'}
                        onValueChange={(value) => handleParameterChange('activation', value)}
                      >
                        <SelectTrigger id="activation" className="border-blue-200 dark:border-blue-800">
                          <SelectValue placeholder="Select activation" />
                        </SelectTrigger>
                        <SelectContent>
                          {activationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Model Summary Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <h4 className="font-medium text-lg">Model Summary</h4>
                  </div>
                  
                  <div className="space-y-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Parameters:</span>
                      <span className="font-mono font-medium text-blue-700 dark:text-blue-300">
                        {selectedNode?.data?.totalParams?.toLocaleString() || '0'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Connections:</span>
                      <span className="font-medium">
                        {edges.filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id).length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estimated Memory:</span>
                      <span className="font-mono font-medium text-purple-700 dark:text-purple-300">
                        {selectedNode?.data?.estimatedMemory || '0 MB'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <div className="flex items-center gap-2">
                        {selectedNode?.data?.status === 'Ready' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : selectedNode?.data?.status === 'Trained' ? (
                          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="font-medium">
                          {selectedNode?.data?.status || 'Ready'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar Footer */}
            <div className="p-4 border-t border-border bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => {
                    // Duplicate node logic
                    handleAddNode(selectedNode.data.type, selectedNode.data)
                  }}
                >
                  Duplicate Layer
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={handleDeleteNode}
                >
                  Remove Layer
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Click arrows to select and delete connections
              </p>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  )
}