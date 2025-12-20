"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, BackgroundVariant, Handle, Position, NodeProps, EdgeProps, BaseEdge, getSmoothStepPath, EdgeLabelRenderer, MarkerType, useReactFlow } from '@xyflow/react'
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
import { PanelRightClose, PanelRightOpen, CheckCircle, AlertCircle, Layers, Brain, Download, PlayCircle, Trash2, MousePointerClick, ArrowRight, Circle, Square, Hexagon, Triangle, Octagon, Diamond, Box, Copy, Settings, MoreVertical, Sparkles, Zap, Activity, RotateCw, Eye, EyeOff, Link, Unlink, ChevronRight } from "lucide-react"

// Custom Sparkling Edge Component for horizontal layout
const SparklingEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const [sparkles, setSparkles] = useState<Array<{ id: number; progress: number }>>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    if (selected) {
      const interval = setInterval(() => {
        setSparkles(prev => [
          ...prev.slice(-3),
          { id: Date.now(), progress: 0 }
        ])
      }, 800)

      return () => clearInterval(interval)
    }
  }, [selected])

  useEffect(() => {
    const animate = () => {
      setSparkles(prev =>
        prev.map(sparkle => ({
          ...sparkle,
          progress: Math.min(sparkle.progress + 0.02, 1)
        })).filter(sparkle => sparkle.progress < 1)
      )
      animationRef.current = requestAnimationFrame(animate)
    }

    if (selected && sparkles.length > 0) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [selected, sparkles.length])

  const getGradientId = () => `gradient-${id}`

  return (
    <>
      <defs>
        <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
        </linearGradient>
        <marker
          id={`arrow-${id}`}
          markerWidth="12"
          markerHeight="12"
          refX="9"
          refY="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M2,2 L2,10 L10,6 L2,2"
            fill="url(#gradient-arrow)"
            stroke="none"
          />
        </marker>
      </defs>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: `url(#${getGradientId()})`,
          strokeWidth: selected ? 4 : 3,
          strokeLinecap: 'round',
          filter: selected ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))' : 'none',
          animation: selected ? 'pulse 2s ease-in-out infinite' : 'none',
        }}
      />
      
      {/* Animated sparkles */}
      {sparkles.map((sparkle) => {
        const point = getPointAtLength(edgePath, sparkle.progress)
        return (
          <circle
            key={sparkle.id}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="url(#gradient-arrow)"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))',
              opacity: 1 - sparkle.progress,
            }}
          />
        )
      })}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}
      </style>
    </>
  )
}

// Helper function to get point along path
const getPointAtLength = (path: string, progress: number) => {
  const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  pathEl.setAttribute('d', path)
  const length = pathEl.getTotalLength()
  const point = pathEl.getPointAtLength(progress * length)
  return point
}

// Node Toolkit Component
const NodeToolkit = ({ nodeId, position, onDelete, onDuplicate, onSettings }: {
  nodeId: string
  position: { x: number; y: number }
  onDelete: () => void
  onDuplicate: () => void
  onSettings: () => void
}) => {
  return (
    <div
      className="absolute z-50 flex items-center gap-1 p-1.5 bg-background/90 backdrop-blur-sm border border-border rounded-lg shadow-lg"
      style={{
        left: position.x + 180,
        top: position.y + 10,
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
        onClick={onDuplicate}
        title="Duplicate"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20"
        onClick={onSettings}
        title="Settings"
      >
        <Settings className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 hover:bg-destructive/10 text-destructive hover:text-destructive"
        onClick={onDelete}
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

// Enhanced Custom Node Components with horizontal layout
const createNodeComponent = (WrappedComponent: React.ComponentType<NodeProps>) => {
  return (props: NodeProps) => {
    const [showToolkit, setShowToolkit] = useState(false)
    const { setNodes, setEdges } = useReactFlow()

    const handleDelete = useCallback(() => {
      setNodes((nds) => nds.filter((n) => n.id !== props.id))
      setEdges((eds) => eds.filter((e) => e.source !== props.id && e.target !== props.id))
    }, [props.id, setNodes, setEdges])

    const handleDuplicate = useCallback(() => {
      const newNode = {
        ...props,
        id: `${props.id}-copy-${Date.now()}`,
        position: {
          x: props.xPos + 220,
          y: props.yPos,
        },
        data: {
          ...props.data,
          layerName: `${props.data.layerName}_copy`,
        },
      }
      setNodes((nds) => [...nds, newNode])
    }, [props, setNodes])

    const handleSettings = useCallback(() => {
      console.log('Settings for node:', props.id)
    }, [props.id])

    return (
      <div 
        className="relative"
        onMouseEnter={() => setShowToolkit(true)}
        onMouseLeave={() => setShowToolkit(false)}
      >
        <WrappedComponent {...props} />
        {showToolkit && (
          <NodeToolkit
            nodeId={props.id}
            position={{ x: 0, y: 0 }}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onSettings={handleSettings}
          />
        )}
      </div>
    )
  }
}

// Layer Visualization Component
const LayerVisualization = ({ units, type, activation }: { units: number, type: string, activation: string }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const renderNeurons = () => {
    if (units <= 32) {
      return Array.from({ length: units }).map((_, i) => (
        <div key={i} className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
      ))
    } else {
      // For 768 units or more, show concatenated format
      const chunkSize = Math.ceil(units / 12)
      return (
        <div className="flex flex-col gap-1">
          {Array.from({ length: 12 }).map((_, row) => (
            <div key={row} className="flex gap-0.5">
              {Array.from({ length: Math.min(chunkSize, units - row * chunkSize) }).map((_, col) => (
                <div 
                  key={col} 
                  className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"
                  style={{ opacity: 0.3 + (col / chunkSize) * 0.7 }}
                />
              ))}
            </div>
          ))}
        </div>
      )
    }
  }

  const getActivationColor = (activation: string) => {
    switch(activation) {
      case 'relu': return 'from-orange-400 to-red-500'
      case 'sigmoid': return 'from-pink-400 to-rose-500'
      case 'tanh': return 'from-amber-400 to-yellow-500'
      case 'softmax': return 'from-purple-400 to-indigo-500'
      default: return 'from-blue-400 to-cyan-500'
    }
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">Layer Visualization:</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-5 text-xs px-2"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      
      <div className="relative">
        {/* Layer container */}
        <div className={`relative p-2 rounded-lg border border-border bg-gradient-to-r ${getActivationColor(activation)}/10 transition-all duration-300 ${
          isExpanded ? 'min-h-[120px]' : 'min-h-[60px]'
        }`}>
          {/* Neurons grid */}
          <div className={`grid ${units <= 32 ? 'grid-cols-8 gap-1' : 'grid-cols-1'} justify-items-center transition-all duration-300 ${
            isExpanded ? 'scale-100 opacity-100' : 'scale-90 opacity-80'
          }`}>
            {renderNeurons()}
          </div>
          
          {/* Overlay info */}
          <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center text-xs">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-background/80 rounded">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
              <span className="font-mono">{units} neurons</span>
            </div>
            <div className="px-2 py-0.5 bg-background/80 rounded">
              <span className="text-muted-foreground">{activation}</span>
            </div>
          </div>
        </div>
        
        {/* Connection dots */}
        {units > 32 && (
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-1 w-1 rounded-full bg-blue-400/60" />
              ))}
            </div>
            <ChevronRight className="h-4 w-4 text-blue-400" />
            <div className="flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-1 w-1 rounded-full bg-blue-400/60" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Original Node Components with horizontal handles
const InputNodeBase = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 dark:from-green-950/30 dark:to-emerald-950/30 dark:border-green-700 min-w-[180px] group hover:shadow-xl transition-all duration-200">
      <Handle type="target" position={Position.Left} className="!bg-green-500 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-md group-hover:scale-110 transition-transform">
          <Square className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-green-800 dark:text-green-300">{data.label}</div>
          <div className="text-xs text-green-600 dark:text-green-400">{data.layerName}</div>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Units:</span>
          <span className="font-medium text-green-700 dark:text-green-300">{data.units}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Activation:</span>
          <span className="font-medium text-green-700 dark:text-green-300">{data.activation}</span>
        </div>
      </div>
      
      {/* Layer Visualization */}
      <LayerVisualization 
        units={data.units || 768} 
        type={data.type} 
        activation={data.activation} 
      />
      
      <Handle type="source" position={Position.Right} className="!bg-green-500 !w-3 !h-3" />
    </div>
  )
}

const DenseNodeBase = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-700 min-w-[180px] group hover:shadow-xl transition-all duration-200">
      <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md group-hover:scale-110 transition-transform">
          <Box className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-blue-800 dark:text-blue-300">{data.label}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">{data.layerName}</div>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Units:</span>
          <span className="font-medium text-blue-700 dark:text-blue-300">{data.units}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Activation:</span>
          <span className="font-medium text-blue-700 dark:text-blue-300">{data.activation}</span>
        </div>
      </div>
      
      {/* Layer Visualization */}
      <LayerVisualization 
        units={data.units || 64} 
        type={data.type} 
        activation={data.activation} 
      />
      
      <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-3 !h-3" />
    </div>
  )
}

const Conv2DNodeBase = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-md bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-300 dark:from-purple-950/30 dark:to-violet-950/30 dark:border-purple-700 min-w-[180px] group hover:shadow-xl transition-all duration-200">
      <Handle type="target" position={Position.Left} className="!bg-purple-500 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-violet-500 rounded-md group-hover:scale-110 transition-transform">
          <Hexagon className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-purple-800 dark:text-purple-300">{data.label}</div>
          <div className="text-xs text-purple-600 dark:text-purple-400">{data.layerName}</div>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Filters:</span>
          <span className="font-medium text-purple-700 dark:text-purple-300">{data.units}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Kernel:</span>
          <span className="font-medium text-purple-700 dark:text-purple-300">{data.kernelSize}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Activation:</span>
          <span className="font-medium text-purple-700 dark:text-purple-300">{data.activation}</span>
        </div>
      </div>
      
      {/* Layer Visualization (for filters) */}
      <LayerVisualization 
        units={data.units || 32} 
        type={data.type} 
        activation={data.activation} 
      />
      
      <Handle type="source" position={Position.Right} className="!bg-purple-500 !w-3 !h-3" />
    </div>
  )
}

const OutputNodeBase = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border-4 border-double border-red-400 dark:from-red-950/30 dark:to-rose-950/30 dark:border-red-600 min-w-[180px] group hover:shadow-xl transition-all duration-200">
      <Handle type="target" position={Position.Left} className="!bg-red-500 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-gradient-to-br from-red-500 to-rose-500 rounded-md group-hover:scale-110 transition-transform">
          <Circle className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-red-800 dark:text-red-300">{data.label}</div>
          <div className="text-xs text-red-600 dark:text-red-400">{data.layerName}</div>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Units:</span>
          <span className="font-medium text-red-700 dark:text-red-300">{data.units}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Activation:</span>
          <span className="font-medium text-red-700 dark:text-red-300">{data.activation}</span>
        </div>
      </div>
      
      {/* Layer Visualization */}
      <LayerVisualization 
        units={data.units || 10} 
        type={data.type} 
        activation={data.activation} 
      />
      
      <Handle type="source" position={Position.Right} className="!bg-red-500 !w-3 !h-3" />
    </div>
  )
}

// Other node components (similar modifications needed)
const PoolingNodeBase = ({ data }: NodeProps) => {
  const isMaxPooling = data.type === 'MaxPooling2D';
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-300 dark:from-cyan-950/30 dark:to-teal-950/30 dark:border-cyan-700 min-w-[180px] group hover:shadow-xl transition-all duration-200">
      <Handle type="target" position={Position.Left} className="!bg-cyan-500 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-md group-hover:scale-110 transition-transform">
          <Triangle className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-cyan-800 dark:text-cyan-300">{data.label}</div>
          <div className="text-xs text-cyan-600 dark:text-cyan-400">{data.layerName}</div>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium text-cyan-700 dark:text-cyan-300">{isMaxPooling ? 'Max' : 'Avg'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pool Size:</span>
          <span className="font-medium text-cyan-700 dark:text-cyan-300">{data.poolSize}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-cyan-500 !w-3 !h-3" />
    </div>
  )
}

const ActivationNodeBase = ({ data }: NodeProps) => {
  const getIcon = (activation: string) => {
    switch(activation) {
      case 'relu': return 'Z';
      case 'sigmoid': return 'S';
      case 'tanh': return 'T';
      case 'softmax': return 'SM';
      default: return 'A';
    }
  }
  
  return (
    <div className="px-4 py-3 shadow-lg rounded-full bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-700 min-w-[160px] group hover:shadow-xl transition-all duration-200">
      <Handle type="target" position={Position.Left} className="!bg-amber-500 !w-3 !h-3" />
      <div className="flex flex-col items-center mb-2">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-1 group-hover:scale-110 transition-transform">
          <span className="h-4 w-4 text-white font-bold text-xs flex items-center justify-center">
            {getIcon(data.activation)}
          </span>
        </div>
        <div className="text-center">
          <div className="font-bold text-sm text-amber-800 dark:text-amber-300">{data.label}</div>
          <div className="text-xs text-amber-600 dark:text-amber-400">{data.activation}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-amber-500 !w-3 !h-3" />
    </div>
  )
}

const DropoutNodeBase = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-md bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-300 dark:from-rose-950/30 dark:to-pink-950/30 dark:border-rose-700 min-w-[180px] border-dashed group hover:shadow-xl transition-all duration-200">
      <Handle type="target" position={Position.Left} className="!bg-rose-500 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-md group-hover:scale-110 transition-transform">
          <Octagon className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-rose-800 dark:text-rose-300">{data.label}</div>
          <div className="text-xs text-rose-600 dark:text-rose-400">{data.layerName}</div>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rate:</span>
          <span className="font-medium text-rose-700 dark:text-rose-300">{data.rate || '0.5'}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-rose-500 !w-3 !h-3" />
    </div>
  )
}

const LSTMNodeBase = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-fuchsia-50 to-pink-50 border-2 border-fuchsia-300 dark:from-fuchsia-950/30 dark:to-pink-950/30 dark:border-fuchsia-700 min-w-[180px] group hover:shadow-xl transition-all duration-200">
      <Handle type="target" position={Position.Left} className="!bg-fuchsia-500 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-md group-hover:scale-110 transition-transform">
          <Diamond className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-fuchsia-800 dark:text-fuchsia-300">{data.label}</div>
          <div className="text-xs text-fuchsia-600 dark:text-fuchsia-400">{data.layerName}</div>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Units:</span>
          <span className="font-medium text-fuchsia-700 dark:text-fuchsia-300">{data.units}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Activation:</span>
          <span className="font-medium text-fuchsia-700 dark:text-fuchsia-300">{data.activation}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-fuchsia-500 !w-3 !h-3" />
    </div>
  )
}

const FlattenNodeBase = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-sm bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300 dark:from-gray-950/30 dark:to-slate-950/30 dark:border-gray-700 min-w-[180px] group hover:shadow-xl transition-all duration-200">
      <Handle type="target" position={Position.Left} className="!bg-gray-500 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-gradient-to-br from-gray-500 to-slate-500 rounded-sm group-hover:scale-110 transition-transform">
          <div className="h-3 w-3 flex flex-col justify-between">
            <div className="h-[2px] w-full bg-white"></div>
            <div className="h-[2px] w-full bg-white"></div>
            <div className="h-[2px] w-full bg-white"></div>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-gray-800 dark:text-gray-300">{data.label}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{data.layerName}</div>
        </div>
      </div>
      <div className="text-xs text-center text-gray-700 dark:text-gray-300 italic">
        Flattens input
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-500 !w-3 !h-3" />
    </div>
  )
}

const BatchNormNodeBase = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-md bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 dark:from-emerald-950/30 dark:to-green-950/30 dark:border-emerald-700 min-w-[180px] group hover:shadow-xl transition-all duration-200">
      <Handle type="target" position={Position.Left} className="!bg-emerald-500 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-md group-hover:scale-110 transition-transform">
          <div className="h-3 w-3 text-white font-bold text-xs flex items-center justify-center">BN</div>
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-emerald-800 dark:text-emerald-300">{data.label}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400">{data.layerName}</div>
        </div>
      </div>
      <div className="text-xs text-center text-emerald-700 dark:text-emerald-300 italic">
        Normalizes activations
      </div>
      <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-3 !h-3" />
    </div>
  )
}

// Wrap all node components with toolkit
const InputNode = createNodeComponent(InputNodeBase)
const DenseNode = createNodeComponent(DenseNodeBase)
const Conv2DNode = createNodeComponent(Conv2DNodeBase)
const PoolingNode = createNodeComponent(PoolingNodeBase)
const ActivationNode = createNodeComponent(ActivationNodeBase)
const DropoutNode = createNodeComponent(DropoutNodeBase)
const OutputNode = createNodeComponent(OutputNodeBase)
const LSTMNode = createNodeComponent(LSTMNodeBase)
const FlattenNode = createNodeComponent(FlattenNodeBase)
const BatchNormNode = createNodeComponent(BatchNormNodeBase)

const nodeTypes = {
  inputNode: InputNode,
  denseNode: DenseNode,
  conv2dNode: Conv2DNode,
  poolingNode: PoolingNode,
  activationNode: ActivationNode,
  dropoutNode: DropoutNode,
  outputNode: OutputNode,
  lstmNode: LSTMNode,
  flattenNode: FlattenNode,
  batchNormNode: BatchNormNode,
}

const edgeTypes = {
  sparkling: SparklingEdge,
}

// Horizontal layout nodes
const initialNodes = [
  { 
    id: 'n1', 
    position: { x: 50, y: 300 }, 
    type: 'inputNode',
    data: { 
      label: 'Input Layer',
      layerName: 'input_layer',
      type: 'Input',
      units: 768, // Changed to 768 for demonstration
      activation: 'None',
      totalParams: 0,
      estimatedMemory: '0.1 MB',
      status: 'Ready'
    } 
  },
  { 
    id: 'n2', 
    position: { x: 350, y: 300 }, 
    type: 'denseNode',
    data: { 
      label: 'Dense Layer',
      layerName: 'dense_1',
      type: 'Dense',
      units: 512,
      activation: 'relu',
      totalParams: 393728, // 768 * 512 + 512
      estimatedMemory: '1.5 MB',
      status: 'Ready'
    } 
  },
  { 
    id: 'n3', 
    position: { x: 650, y: 300 }, 
    type: 'denseNode',
    data: { 
      label: 'Dense Layer',
      layerName: 'dense_2',
      type: 'Dense',
      units: 256,
      activation: 'relu',
      totalParams: 131328, // 512 * 256 + 256
      estimatedMemory: '0.5 MB',
      status: 'Ready'
    } 
  },
  { 
    id: 'n4', 
    position: { x: 950, y: 300 }, 
    type: 'outputNode',
    data: { 
      label: 'Output Layer',
      layerName: 'output_layer',
      type: 'Output',
      units: 10,
      activation: 'softmax',
      totalParams: 2570, // 256 * 10 + 10
      estimatedMemory: '0.01 MB',
      status: 'Ready'
    } 
  },
]

const initialEdges = [
  { 
    id: 'n1-n2', 
    source: 'n1', 
    target: 'n2',
    type: 'sparkling',
    animated: true,
    style: { strokeWidth: 3 },
  },
  { 
    id: 'n2-n3', 
    source: 'n2', 
    target: 'n3',
    type: 'sparkling',
    animated: true,
    style: { strokeWidth: 3 },
  },
  { 
    id: 'n3-n4', 
    source: 'n3', 
    target: 'n4',
    type: 'sparkling',
    animated: true,
    style: { strokeWidth: 3 },
  }
]

export default function Page() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [selectedNode, setSelectedNode] = useState(initialNodes[0]) // Start with input node selected
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [isTraining, setIsTraining] = useState(false)
  const [showAllToolkits, setShowAllToolkits] = useState(false)
  const [connectionStyle, setConnectionStyle] = useState('sparkling')
  const [viewMode, setViewMode] = useState<'horizontal' | 'compact'>('horizontal')
  const nodeIdCounter = useRef(5)

  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  )
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  )
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge({
      ...params,
      type: connectionStyle,
      animated: true,
      style: { strokeWidth: 3 },
    }, edgesSnapshot)),
    [connectionStyle]
  )

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
    setSelectedEdge(null)
    setIsRightSidebarOpen(true)
  }, [])

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation()
    setSelectedEdge(edge)
    setSelectedNode(null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null)
    setSelectedNode(null)
  }, [])

  const handleDeleteEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges(edges => edges.filter(edge => edge.id !== selectedEdge.id))
      setSelectedEdge(null)
    }
  }, [selectedEdge])

  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setEdges(edges => edges.filter(edge => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ))
      setNodes(nds => nds.filter(node => node.id !== selectedNode.id))
      setSelectedNode(null)
      setIsRightSidebarOpen(false)
    }
  }, [selectedNode])

  const getNodeType = (nodeType: string) => {
    switch(nodeType) {
      case 'Input': return 'inputNode'
      case 'Output': return 'outputNode'
      case 'Dense': return 'denseNode'
      case 'Conv2D': return 'conv2dNode'
      case 'LSTM': return 'lstmNode'
      case 'GRU': return 'lstmNode'
      case 'ReLU':
      case 'Sigmoid':
      case 'Tanh':
      case 'Softmax': return 'activationNode'
      case 'Dropout': return 'dropoutNode'
      case 'MaxPooling2D':
      case 'AveragePooling2D': return 'poolingNode'
      case 'BatchNormalization':
      case 'LayerNormalization': return 'batchNormNode'
      case 'Flatten': return 'flattenNode'
      default: return 'denseNode'
    }
  }

  const handleAddNode = useCallback((nodeType: string, config: any) => {
    const newNodeId = `node-${nodeIdCounter.current++}`
    const layerCount = nodes.filter(n => n.data.type === nodeType).length
    const layerName = `${nodeType.toLowerCase()}_${layerCount + 1}`
    const flowNodeType = getNodeType(nodeType)
    
    const newNode = {
      id: newNodeId,
      type: flowNodeType,
      position: {
        x: Math.max(...nodes.map(n => n.position.x)) + 300,
        y: 300
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
      const flowNodeType = getNodeType(nodeType)
      
      const newNode = {
        id: newNodeId,
        type: flowNodeType,
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

  const handleDuplicateNode = useCallback(() => {
    if (!selectedNode) return
    
    const newNodeId = `node-${nodeIdCounter.current++}`
    const layerCount = nodes.filter(n => n.data.type === selectedNode.data.type).length
    const layerName = `${selectedNode.data.type.toLowerCase()}_${layerCount + 1}`
    
    const newNode = {
      ...selectedNode,
      id: newNodeId,
      position: {
        x: selectedNode.xPos + 220,
        y: selectedNode.yPos,
      },
      data: {
        ...selectedNode.data,
        layerName: layerName,
      },
    }
    
    setNodes(nds => [...nds, newNode])
    setSelectedNode(newNode)
  }, [selectedNode, nodes])

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

  const connectionStyleOptions = [
    { value: 'sparkling', label: 'Sparkling', icon: <Sparkles className="h-3 w-3" /> },
    { value: 'animated', label: 'Animated', icon: <Zap className="h-3 w-3" /> },
    { value: 'solid', label: 'Solid', icon: <Link className="h-3 w-3" /> },
  ]

  const viewModeOptions = [
    { value: 'horizontal', label: 'Horizontal', icon: <ArrowRight className="h-3 w-3" /> },
    { value: 'compact', label: 'Compact', icon: <Layers className="h-3 w-3" /> },
  ]

  return (
    <SidebarProvider>
      <AppSidebar onAddNode={handleAddNode} />
      
      <div className="flex flex-1 min-h-0">
        <SidebarInset className="flex flex-col flex-1">
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

            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="View Mode" />
                </SelectTrigger>
                <SelectContent>
                  {viewModeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={connectionStyle} onValueChange={setConnectionStyle}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Connection Style" />
                </SelectTrigger>
                <SelectContent>
                  {connectionStyleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllToolkits(!showAllToolkits)}
                className="gap-2"
              >
                {showAllToolkits ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Toolkits
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Toolkits
                  </>
                )}
              </Button>

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
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              className="w-full h-full"
            >
              <Background color="#a6a6a6" variant={BackgroundVariant.Dots} gap={10} />
              
              <style>
                {`
                  .react-flow__edge.selected .react-flow__edge-path {
                    stroke: #ef4444 !important;
                    stroke-width: 3 !important;
                  }
                  .react-flow__edge.selected .react-flow__edge-interaction {
                    stroke: #ef4444 !important;
                  }
                  .react-flow__node {
                    cursor: pointer;
                  }
                  .react-flow__node:hover {
                    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));
                  }
                  .connection-flow {
                    animation: flow 2s linear infinite;
                  }
                  @keyframes flow {
                    0% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: 20; }
                  }
                `}
              </style>
              
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 text-sm text-muted-foreground shadow-lg">
                <p className="flex items-center gap-2">
                  <span>🏗️</span>
                  <span>Horizontal Flow • Shows 768+ neurons in concatenated format • Click to expand visualization</span>
                </p>
              </div>

              {selectedEdge && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Connection Selected</span>
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

              {/* Global Toolkit Toggle Indicator */}
              {showAllToolkits && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  Toolkits Enabled
                </div>
              )}
            </ReactFlow>
          </main>
        </SidebarInset>

        {isRightSidebarOpen && selectedNode && (
          <div className="w-96 border-l border-border bg-background flex flex-col">
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

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
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

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <h4 className="font-medium text-lg">Parameters</h4>
                  </div>
                  
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
                                option.value === 'Output' ? 'bg-red-500' :
                                option.value === 'Dropout' ? 'bg-rose-500' :
                                option.value === 'MaxPooling2D' ? 'bg-cyan-500' :
                                option.value === 'BatchNormalization' ? 'bg-emerald-500' :
                                'bg-gray-500'
                              }`}></div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                        placeholder="768"
                        className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  )}

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

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <h4 className="font-medium text-lg">Layer Visualization</h4>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 rounded-lg border border-border">
                    <LayerVisualization 
                      units={selectedNode?.data?.units || 768} 
                      type={selectedNode?.data?.type} 
                      activation={selectedNode?.data?.activation} 
                    />
                  </div>
                </div>

                <Separator />

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

            <div className="p-4 border-t border-border bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={handleDuplicateNode}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Layer
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={handleDeleteNode}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Layer
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Horizontal layout • Shows 768+ neurons in concatenated format
              </p>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  )
}