"use client"

import * as React from "react"
import { 
  Search, Layers, Box, Image, Code, Cpu, Repeat, GitBranch,
  Square, Circle, Zap, Sigma, TrendingUp, Minus, Plus, Combine,
  MinusSquare, DivideSquare, BarChart, BarChart2, CloudRain, 
  Shield, Tag, TrendingDown, Crop, FileOutput, FolderTree,
  ChevronRight, Brain,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// --- Data Structure ---
const sidebarSections = [
  {
    title: "Input",
    icon: Box,
    items: [
      { name: "Input Layer", type: "Input", icon: Layers },
      { name: "Embedding", type: "Embedding", icon: Code },
      { name: "Image Input", type: "Image Input", icon: Image },
    ]
  },
  {
    title: "Core Layers",
    icon: Cpu,
    items: [
      { name: "Dense Layer", type: "Dense", icon: Square },
      { name: "Conv2D", type: "Conv2D", icon: Cpu },
      { name: "LSTM", type: "LSTM", icon: Repeat },
      { name: "GRU", type: "GRU", icon: GitBranch },
    ]
  },
  {
    title: "Pooling & Norm",
    icon: BarChart,
    items: [
      { name: "MaxPooling2D", type: "MaxPooling2D", icon: MinusSquare },
      { name: "AveragePooling2D", type: "AveragePooling2D", icon: DivideSquare },
      { name: "BatchNormalization", type: "BatchNormalization", icon: BarChart },
      { name: "LayerNormalization", type: "LayerNormalization", icon: BarChart2 },
    ]
  },
  {
    title: "Activations",
    icon: Zap,
    items: [
      { name: "ReLU", type: "ReLU", icon: Zap },
      { name: "Sigmoid", type: "Sigmoid", icon: Sigma },
      { name: "Tanh", type: "Tanh", icon: TrendingUp },
      { name: "Softmax", type: "Softmax", icon: Circle },
      { name: "Dropout", type: "Dropout", icon: CloudRain },
      { name: "L1/L2 Regularization", type: "Regularization", icon: Shield },
    ]
  },
  {
    title: "Outputs",
    icon: FileOutput,
    items: [
      { name: "Output Layer", type: "Output", icon: FileOutput },
      { name: "Classification", type: "Classification", icon: Tag },
      { name: "Regression", type: "Regression", icon: TrendingDown },
    ]
  },
  {
    title: "Operations",
    icon: FolderTree,
    items: [
      { name: "Concatenate", type: "Concatenate", icon: Combine },
      { name: "Add", type: "Add", icon: Plus },
      { name: "Flatten", type: "Flatten", icon: Minus },
      { name: "Reshape", type: "Reshape", icon: Crop },
    ]
  }
]

// Configuration mapping for each node type
const nodeConfigs: Record<string, any> = {
  "Input": { 
    units: 784,
    activation: 'None',
    totalParams: 0,
    estimatedMemory: '0.1 MB'
  },
  "Dense": { 
    units: 64,
    activation: 'relu',
    totalParams: 50240,
    estimatedMemory: '0.2 MB'
  },
  "Conv2D": { 
    units: 32,
    kernelSize: '3x3',
    activation: 'relu',
    totalParams: 320,
    estimatedMemory: '0.15 MB'
  },
  "LSTM": { 
    units: 64,
    activation: 'tanh',
    totalParams: 66560,
    estimatedMemory: '0.3 MB'
  },
  "GRU": { 
    units: 64,
    activation: 'tanh',
    totalParams: 24960,
    estimatedMemory: '0.2 MB'
  },
  "ReLU": { 
    activation: 'relu',
    totalParams: 0,
    estimatedMemory: '0.05 MB'
  },
  "Sigmoid": { 
    activation: 'sigmoid',
    totalParams: 0,
    estimatedMemory: '0.05 MB'
  },
  "Dropout": { 
    rate: 0.5,
    totalParams: 0,
    estimatedMemory: '0.05 MB'
  },
  "MaxPooling2D": { 
    poolSize: '2x2',
    totalParams: 0,
    estimatedMemory: '0.05 MB'
  },
  "Flatten": { 
    totalParams: 0,
    estimatedMemory: '0.05 MB'
  },
  "Add": { 
    totalParams: 0,
    estimatedMemory: '0.05 MB'
  },
  "Concatenate": { 
    totalParams: 0,
    estimatedMemory: '0.05 MB'
  },
  "Output": { 
    units: 10,
    activation: 'softmax',
    totalParams: 650,
    estimatedMemory: '0.1 MB'
  }
}

interface AppSidebarProps {
  onAddNode?: (nodeType: string, config: any) => void;
}

export function AppSidebar({ onAddNode }: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [openSections, setOpenSections] = React.useState<string[]>(["Input", "Core Layers"])

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    const config = nodeConfigs[nodeType] || {}
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.setData('application/json', JSON.stringify(config))
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleClick = (nodeType: string, nodeName: string) => {
    if (onAddNode) {
      const config = nodeConfigs[nodeType] || {}
      onAddNode(nodeType, { ...config, label: nodeName })
    }
  }

  // Filter Logic
  const filteredSections = sidebarSections.map(section => {
    const filteredItems = section.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return { ...section, items: filteredItems }
  }).filter(section => 
    section.items.length > 0 || 
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        DeepBlocks
      </SidebarHeader>
      
      <SidebarContent>
        <div className="flex items-center gap-2 rounded-md px-3 ring-offset-background focus-within:ring-1 focus-within:ring-ring">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <SidebarMenu>
          {filteredSections.map((section) => {
            const isOpen = openSections.includes(section.title) || searchQuery.length > 0
            const SectionIcon = section.icon
            
            return (
              <Collapsible
                key={section.title}
                open={isOpen}
                onOpenChange={(open) => {
                  setOpenSections(prev => 
                    open ? [...prev, section.title] : prev.filter(t => t !== section.title)
                  )
                }}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={section.title}>
                      {SectionIcon && <SectionIcon />}
                      <span>{section.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {section.items.map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <SidebarMenuSubItem key={item.type}>
                            <div
                              className="flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                              draggable
                              onDragStart={(e) => handleDragStart(e, item.type)}
                              onClick={() => handleClick(item.type, item.name)}
                              title={`Click to add ${item.name} or drag to canvas`}
                            >
                              {ItemIcon && <ItemIcon className="h-4 w-4 opacity-70" />}
                              <span>{item.name}</span>
                            </div>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}