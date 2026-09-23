"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"
import ReactFlow, {
  Background,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type NodeTypes,
  Panel,
  type ReactFlowInstance,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow"
import "reactflow/dist/style.css"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  Eye,
  FolderOpen,
  GitBranch,
  HelpCircle,
  Maximize2,
  MessageSquare,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Plus,
  Save,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { TestConversationModal } from "./modals/test-conversation-modal"
import { ActionNodeComponent } from "./nodes/action-node"
import { ConditionNodeComponent } from "./nodes/condition-node"
import { MessageNodeComponent } from "./nodes/message-node"
import { QuestionNodeComponent } from "./nodes/question-node"
import { NodePropertiesPanel } from "./panels/node-properties-panel"
import { TreePropertiesPanel } from "./panels/tree-properties-panel"
import { YamlPreview } from "./panels/yaml-preview"

import { type ConversationNode, NodeFactory } from "@/lib/node-classes"
import type { ConversationTree, NodeType } from "@/types/conversation-tree"
import yaml from "js-yaml"
import type React from "react"

const nodeTypes: NodeTypes = {
  message: MessageNodeComponent,
  question: QuestionNodeComponent,
  action: ActionNodeComponent,
  condition: ConditionNodeComponent,
}

const initialNodes: Node[] = [
  {
    id: "greeting",
    type: "message",
    position: { x: 250, y: 100 },
    data: {
      label: "greeting",
      npcId: "guide",
      messages: {
        es: "¡Hola aventurero! Bienvenido a nuestro servidor.",
        en: "Hello adventurer! Welcome to our server.",
        default: "¡Hola! Bienvenido.",
      },
      actions: {},
      autoNext: "",
      autoNextDelay: 0,
      pitch: 0.4,
    },
  },
]

const initialEdges: Edge[] = []

const initialTree: ConversationTree = {
  id: "new_tree",
  displayName: "Nueva Conversación",
  description: "Descripción de la conversación",
  rootNodeId: "greeting",
  repeatable: true,
  responseTimeout: 30,
  assignedNpc: "guide",
  conditions: {},
  globalVariables: {},
  soundConfig: {
    defaultPitch: 0.4,
    defaultVolume: 1.0,
    defaultSoundSet: "friendly",
  },
}

export function ConversationTreeEditor() {
  // Clipboard functionality

  // Tree management
  const [trees, setTrees] = useState<ConversationTree[]>([initialTree])
  const [activeTreeIndex, setActiveTreeIndex] = useState(0)
  const [treeNodes, setTreeNodes] = useState<Record<number, Node[]>>({ 0: initialNodes })
  const [treeEdges, setTreeEdges] = useState<Record<number, Edge[]>>({ 0: initialEdges })

  // Current tree state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [treeProperties, setTreeProperties] = useState<ConversationTree>(initialTree)

  // UI state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedNodeObject, setSelectedNodeObject] = useState<ConversationNode | null>(null)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showMiniMap, setShowMiniMap] = useState(true)
  const [focusMode, setFocusMode] = useState(false)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))

      if (selectedNode?.id === nodeId) {
        setSelectedNode(null)
      }
    },
    [setNodes, setEdges, selectedNode],
  )



  // Load the current tree data when activeTreeIndex changes
  useEffect(() => {
    const currentNodes = treeNodes[activeTreeIndex] || []
    const currentEdges = treeEdges[activeTreeIndex] || []
    const currentTree = trees[activeTreeIndex]

    setNodes(currentNodes)
    setEdges(currentEdges)
    setTreeProperties(currentTree)
    setSelectedNode(null)
  }, [activeTreeIndex, setNodes, setEdges, treeNodes, treeEdges, trees])

  // Update selected node object when selected node changes
  useEffect(() => {
    if (selectedNode) {
      const nodeObj = NodeFactory.createNode(selectedNode.type!, selectedNode.id, selectedNode.position)
      nodeObj.updateData(selectedNode.data)
      setSelectedNodeObject(nodeObj)
    } else {
      setSelectedNodeObject(null)
    }
  }, [selectedNode])

  // Save current tree state when nodes or edges change
  useEffect(() => {
    setTreeNodes((prev) => ({
      ...prev,
      [activeTreeIndex]: nodes,
    }))
  }, [nodes, activeTreeIndex])

  useEffect(() => {
    setTreeEdges((prev) => ({
      ...prev,
      [activeTreeIndex]: edges,
    }))
  }, [edges, activeTreeIndex])

  // Save tree properties when they change
  useEffect(() => {
    setTrees((prev) => {
      const newTrees = [...prev]
      newTrees[activeTreeIndex] = treeProperties
      return newTrees
    })
  }, [treeProperties, activeTreeIndex])

// ...existing code...
const updateNodeData = useCallback(
  (nodeId: string, newData: any) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        if (node.id === nodeId) {
          const oldLabel = node.data.label || node.id
          const updatedNode = { ...node, data: { ...node.data, ...newData } }
          const newLabel = updatedNode.data.label || updatedNode.id

          // Validar etiqueta única
          if (newData.label && oldLabel !== newLabel) {
            const existingLabels = nds.filter((n) => n.id !== nodeId).map((n) => n.data.label || n.id)
            if (existingLabels.includes(newLabel)) {
              console.warn(`La etiqueta "${newLabel}" ya existe.`)
              return node
            }

            // Actualizar root_node si es necesario
            if (treeProperties.rootNodeId === oldLabel) {
              setTreeProperties((prev) => ({
                ...prev,
                rootNodeId: newLabel,
              }))
            }
          }

          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedNode)
          }
          return updatedNode
        }
        return node
      })

      // Actualizar referencias en otros nodos SIN setTimeout
      if (newData.label) {
        const oldLabel = nds.find(n => n.id === nodeId)?.data.label || nodeId
        const newLabel = newData.label
        
        if (oldLabel !== newLabel) {
          return updatedNodes.map((n) => {
            if (n.id === nodeId) return n
            
            let updatedNodeData = { ...n.data }
            let updated = false

            // Actualizar autoNext
            if (n.data.autoNext === oldLabel) {
              updatedNodeData.autoNext = newLabel
              updated = true
            }

            // Actualizar choices
            if (n.data.choices) {
              const updatedChoices = { ...n.data.choices }
              Object.keys(updatedChoices).forEach((choiceKey) => {
                if (updatedChoices[choiceKey].nextNode === oldLabel) {
                  updatedChoices[choiceKey] = {
                    ...updatedChoices[choiceKey],
                    nextNode: newLabel,
                  }
                  updated = true
                }
              })
              if (updated) {
                updatedNodeData.choices = updatedChoices
              }
            }

            // Actualizar condition nodes
            if (n.data.trueNode === oldLabel) {
              updatedNodeData.trueNode = newLabel
              updated = true
            }
            if (n.data.falseNode === oldLabel) {
              updatedNodeData.falseNode = newLabel
              updated = true
            }

            return updated ? { ...n, data: updatedNodeData } : n
          })
        }
      }

      return updatedNodes
    })
  },
  [selectedNode, treeProperties.rootNodeId, setTreeProperties],
)
// ...existing code...

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds))

      // Automatically set next_node connections
      if (params.source && params.target) {
        const sourceNode = nodes.find((n) => n.id === params.source)
        const targetNode = nodes.find((n) => n.id === params.target)

        if (sourceNode && targetNode) {
          const targetLabel = targetNode.data.label || targetNode.id

          // Handle different node types
          if (sourceNode.type === "message") {
            // For message nodes, set autoNext
            updateNodeData(sourceNode.id, { autoNext: targetLabel })
          } else if (sourceNode.type === "question") {
            //get what index of the connection it is
            const handleId = params.sourceHandle!
            const choiceIndex = parseInt(handleId.split("-")[1])
            //get all choices
            const choices = sourceNode.data.choices || {}
            //get choice at the same index, but remember choices are "keyed" and not indexed
            const choice = Object.values(choices)[choiceIndex]
            //but also get the key of the choice
            let choiceKey = ""
            for (const key in choices) {
              if (choices[key] === choice) {
                choiceKey = key
                break
              }
            }
            if (choice) {
              updateNodeData(sourceNode.id, { choices: { ...choices, [choiceKey]: { ...choice, nextNode: targetLabel } } })
            }

          } else if (sourceNode.type === "condition") {
            // For condition nodes, determine if it's true or false connection
            const handleId = params.sourceHandle
            if (handleId === "true") {
              updateNodeData(sourceNode.id, { trueNode: targetLabel })
            } else if (handleId === "false") {
              updateNodeData(sourceNode.id, { falseNode: targetLabel })
            }
          }
        }
      }
    },
    [setEdges, nodes, updateNodeData],
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const addNode = useCallback(
    (type: NodeType) => {
      const timestamp = Date.now()
      const nodeId = `${type}_${timestamp}`

      // Generate a meaningful default label
      const defaultLabels = {
        message: "nuevo_mensaje",
        question: "nueva_pregunta",
        action: "nueva_accion",
        condition: "nueva_condicion",
      }

      const baseLabel = defaultLabels[type] || type

      // Ensure unique label
      const existingLabels = nodes.map((n) => n.data.label || n.id)
      let uniqueLabel = baseLabel
      let counter = 1

      while (existingLabels.includes(uniqueLabel)) {
        uniqueLabel = `${baseLabel}_${counter}`
        counter++
      }

      const position = reactFlowInstance
        ? reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
        : { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 }

      const nodeObj = NodeFactory.createNode(type, nodeId, position)

      // Set the unique label
      nodeObj.updateData({ label: uniqueLabel })

      const reactFlowNode = nodeObj.toReactFlowNode()

      setNodes((nds) => nds.concat(reactFlowNode))
      setSelectedNode(reactFlowNode)
    },
    [setNodes, reactFlowInstance, nodes],
  )

  const exportToYaml = useCallback(() => {
    const yamlData = generateYamlFromNodes(nodes, edges, treeProperties)
    const blob = new Blob([yamlData], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${treeProperties.id}.yml`
    a.click()
    URL.revokeObjectURL(url)
  }, [nodes, edges, treeProperties])

  const addNewTree = useCallback(() => {
    const newTreeIndex = trees.length
    const newTree: ConversationTree = {
      id: `tree_${Date.now()}`,
      displayName: `Conversación ${newTreeIndex + 1}`,
      description: "Nueva conversación",
      rootNodeId: "greeting",
      repeatable: true,
      responseTimeout: 30,
      assignedNpc: "guide",
      conditions: {},
      globalVariables: {},
      soundConfig: {
        defaultPitch: 0.4,
        defaultVolume: 1.0,
        defaultSoundSet: "friendly",
      },
    }

    const newInitialNode: Node = {
      id: "greeting",
      type: "message",
      position: { x: 250, y: 100 },
      data: {
        label: "greeting",
        npcId: "guide",
        messages: {
          es: "¡Hola aventurero!",
          en: "Hello adventurer!",
          default: "¡Hola!",
        },
        actions: {},
        autoNext: "",
        autoNextDelay: 0,
        pitch: 0.4,
      },
    }

    setTrees((prev) => [...prev, newTree])
    setTreeNodes((prev) => ({ ...prev, [newTreeIndex]: [newInitialNode] }))
    setTreeEdges((prev) => ({ ...prev, [newTreeIndex]: [] }))
    setActiveTreeIndex(newTreeIndex)
  }, [trees.length])

  const switchToTree = useCallback(
    (index: number) => {
      if (index !== activeTreeIndex) {
        setActiveTreeIndex(index)
      }
    },
    [activeTreeIndex],
  )

  const nodeTypeButtons = [
    { type: "message" as NodeType, label: "Mensaje", icon: MessageSquare, color: "bg-green-500 hover:bg-green-600" },
    { type: "question" as NodeType, label: "Pregunta", icon: HelpCircle, color: "bg-blue-500 hover:bg-blue-600" },
    { type: "action" as NodeType, label: "Acción", icon: Zap, color: "bg-amber-500 hover:bg-amber-600" },
    { type: "condition" as NodeType, label: "Condición", icon: GitBranch, color: "bg-purple-500 hover:bg-purple-600" },
  ]

  const validateUniqueLabels = useCallback(() => {
    const labels = nodes.map((node) => node.data.label || node.id)
    const duplicates = labels.filter((label, index) => labels.indexOf(label) !== index)

    if (duplicates.length > 0) {
      console.warn("Etiquetas duplicadas encontradas:", duplicates)
      // Aquí podrías mostrar una notificación al usuario
    }

    return duplicates.length === 0
  }, [nodes])
// Memoizar el componente del control panel
const MemoizedNodePropertiesPanel = memo(NodePropertiesPanel, (prevProps, nextProps) => {
  return (
    prevProps.nodeId === nextProps.nodeId 
  )
})

  return (
    <div className="h-screen w-full flex bg-slate-50">
      {/* Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left side - Tree navigation */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </Button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-slate-800">Editor de Conversaciones</span>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Select
                value={activeTreeIndex.toString()}
                onValueChange={(value) => switchToTree(Number.parseInt(value))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {trees.map((tree, index) => (
                    <SelectItem key={tree.id} value={index.toString()}>
                      {tree.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={addNewTree}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Center - Quick stats */}
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {nodes.length} nodos
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {edges.length} conexiones
            </Badge>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">

            <Button variant="outline" size="sm" onClick={() => setShowMiniMap(!showMiniMap)}>
              <Eye className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => setFocusMode(!focusMode)}>
              {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button variant="outline" size="sm" onClick={() => setIsTestModalOpen(true)}>
              <Play className="w-4 h-4 mr-1" />
              Probar
            </Button>

            <Button variant="outline" size="sm" onClick={exportToYaml}>
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>

            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Importar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full pt-14">
        {/* Sidebar */}
        {!sidebarCollapsed && !focusMode && (
          <div className="w-80 border-r bg-white shadow-sm flex flex-col">
            <Tabs defaultValue="nodes" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 m-4">
                <TabsTrigger value="nodes">Nodos</TabsTrigger>
                <TabsTrigger value="tree">Árbol</TabsTrigger>
                <TabsTrigger value="preview">Vista</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="nodes" className="px-4 pb-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Añadir Nodos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {nodeTypeButtons.map((nodeType) => {
                        const Icon = nodeType.icon
                        return (
                          <Button
                            key={nodeType.type}
                            variant="outline"
                            className={`w-full justify-start h-12 ${nodeType.color} text-white border-0 hover:scale-105 transition-all`}
                            onClick={() => addNode(nodeType.type)}
                          >
                            <Icon className="w-5 h-5 mr-3" />
                            {nodeType.label}
                          </Button>
                        )
                      })}
                    </CardContent>
                  </Card>

                  <Card className="mt-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setIsTestModalOpen(true)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Probar Conversación
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={exportToYaml}>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar YAML
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Cargar YAML
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tree" className="px-4 pb-4">
                  <TreePropertiesPanel
                    tree={treeProperties}
                    onUpdate={(updatedTree) => {
                      setTreeProperties(updatedTree)
                    }}
                  />
                </TabsContent>

                <TabsContent value="preview" className="px-4 pb-4">
                  <YamlPreview nodes={nodes} edges={edges} tree={treeProperties} />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <div ref={reactFlowWrapper} className="h-full w-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                className="bg-gradient-to-br from-slate-50 to-blue-50"
              >
                <Background color="#e2e8f0" gap={20} />
                <Controls className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-lg" />

                {showMiniMap && (
                  <MiniMap
                    nodeColor={(node) => {
                      switch (node.type) {
                        case "message":
                          return "#10b981"
                        case "question":
                          return "#3b82f6"
                        case "action":
                          return "#f59e0b"
                        case "condition":
                          return "#8b5cf6"
                        default:
                          return "#6b7280"
                      }
                    }}
                    className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg"
                  />
                )}

                {/* Floating Node Toolbar */}
                {!focusMode && (
                  <Panel position="top-center">
                    <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-slate-200">
                      <CardContent className="p-2">
                        <div className="flex items-center gap-1">
                          {nodeTypeButtons.map((nodeType) => {
                            const Icon = nodeType.icon
                            return (
                              <Button
                                key={nodeType.type}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-slate-100"
                                onClick={() => addNode(nodeType.type)}
                                title={`Añadir ${nodeType.label}`}
                              >
                                <Icon className="w-4 h-4" />
                              </Button>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </Panel>
                )}
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </div>

        {/* Properties Panel */}
        {selectedNode  && !focusMode && (
          <div className="w-96 border-l bg-white shadow-sm">
            <MemoizedNodePropertiesPanel
              nodeId={selectedNode.id}
              onUpdate={updateNodeData}
              onDelete={deleteNode}
              node={selectedNode }
            />
          </div>
        )}
      </div>

      {/* Test Conversation Modal */}
      <TestConversationModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        nodes={nodes}
        edges={edges}
        tree={treeProperties}
      />
    </div>
  )
}

function generateYamlFromNodes(nodes: Node[], edges: Edge[], tree: ConversationTree): string {
  const yamlNodes: any = {}

  nodes.forEach((node) => {
    // Use the label as the key, fallback to ID if no label
    const nodeKey = node.data.label || node.id

    yamlNodes[nodeKey] = {
      type: node.type,
    }

    // Add common properties for message and question nodes
    if (node.type === "message" || node.type === "question") {
      yamlNodes[nodeKey].npcId = node.data.npcId
      yamlNodes[nodeKey].messages = node.data.messages
      yamlNodes[nodeKey].pitch = node.data.pitch
    }

    // Add type-specific properties
    if (node.type === "message") {
      yamlNodes[nodeKey].actions = node.data.actions || {}
      yamlNodes[nodeKey].autoNext = node.data.autoNext || ""
      yamlNodes[nodeKey].autoNextDelay = node.data.autoNextDelay || 0
    }

    if (node.type === "question") {
      yamlNodes[nodeKey].actions = node.data.actions || {}
      yamlNodes[nodeKey].conditions = node.data.conditions || {}

      if (node.data.choices) {
        const formattedChoices: any = {}
        Object.entries(node.data.choices).forEach(([key, choice]: [string, any]) => {
          formattedChoices[key] = {
            texts: choice.texts,
            trigger: choice.trigger,
            nextNode: choice.next_node || choice.nextNode || "",
          }

          // Add conditions and actions if they exist
          if (choice.conditions && Object.keys(choice.conditions).length > 0) {
            formattedChoices[key].conditions = choice.conditions
          }
          if (choice.actions && Object.keys(choice.actions).length > 0) {
            formattedChoices[key].actions = choice.actions
          }
        })
        yamlNodes[nodeKey].choices = formattedChoices
      }
    }

    if (node.type === "action") {
      yamlNodes[nodeKey].actions = node.data.actions || {}
      if (node.data.endNode) {
        yamlNodes[nodeKey].endNode = node.data.endNode
      }
    }

    if (node.type === "condition") {
      yamlNodes[nodeKey].conditions = node.data.conditions || {}
      yamlNodes[nodeKey].trueNode = node.data.trueNode || ""
      yamlNodes[nodeKey].falseNode = node.data.falseNode || ""
    }
  })

  const yamlTree = {
    trees: {
      conversations: {
        [tree.id]: {
          display_name: tree.displayName,
          description: tree.description,
          root_node: tree.rootNodeId,
          repeatable: tree.repeatable,
          response_timeout: tree.responseTimeout,
          assigned_npc: tree.assignedNpc,
          conditions: tree.conditions,
          global_variables: tree.globalVariables,
          sound_config: tree.soundConfig,
          nodes: yamlNodes,
        },
      },
    },
  }

  try {
    return yaml.dump(yamlTree, { indent: 2 })
  } catch (e) {
    console.error(e)
    return JSON.stringify(yamlTree, null, 2)
  }
}
