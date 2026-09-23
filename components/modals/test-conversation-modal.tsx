"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { Node, Edge } from "reactflow"
import type { ConversationTree } from "@/types/conversation-tree"
import { User, Bot, ArrowRight, MessageSquare, Zap, AlertCircle } from "lucide-react"

interface TestConversationModalProps {
  isOpen: boolean
  onClose: () => void
  nodes: Node[]
  edges: Edge[]
  tree: ConversationTree
}

export function TestConversationModal({ isOpen, onClose, nodes, edges, tree }: TestConversationModalProps) {
  const [activeTab, setActiveTab] = useState("setup")
  const [placeholders, setPlaceholders] = useState<Record<string, string>>({
    player_name: "Steve",
    player_display_name: "Steve",
    player_uuid: "550e8400-e29b-41d4-a716-446655440000",
    player_level: "25",
    player_health: "20",
    player_max_health: "20",
    player_food: "20",
    player_exp: "0.5",
    world_name: "world",
    world_time: "12000",
    world_players: "5",
    player_x: "100",
    player_y: "64",
    player_z: "200",
    date: "01/01/2023",
    time: "12:00:00",
    datetime: "01/01/2023 12:00:00",
    server_online: "10",
    server_max: "100",
  })
  const [metadata, setMetadata] = useState<Record<string, string>>({})
  const [permissions, setPermissions] = useState<string[]>([])
  const [quests, setQuests] = useState<Record<string, string>>({})
  const [items, setItems] = useState<Record<string, number>>({})
  const [money, setMoney] = useState(1000)

  // Conversation state
  const [currentNodeId, setCurrentNodeId] = useState("")
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [availableChoices, setAvailableChoices] = useState<any[]>([])
  const [isConversationStarted, setIsConversationStarted] = useState(false)

  // Extract placeholders, metadata, permissions, etc. from the conversation tree
  useEffect(() => {
    if (isOpen) {
      // Reset state
      setCurrentNodeId("")
      setConversationHistory([])
      setAvailableChoices([])
      setIsConversationStarted(false)
      setActiveTab("setup")

      // Extract custom values from nodes
      const extractedMetadata: Record<string, string> = {}
      const extractedPermissions: string[] = []
      const extractedQuests: Record<string, string> = {}
      const extractedItems: Record<string, number> = {}

      // Scan all nodes for metadata, permissions, quests, items
      nodes.forEach((node) => {
        // Extract from conditions
        if (node.data.conditions) {
          Object.values(node.data.conditions).forEach((condition: any) => {
            if (condition.type === "permission" && condition.value) {
              if (!extractedPermissions.includes(condition.value)) {
                extractedPermissions.push(condition.value)
              }
            } else if (condition.type === "metadata" && condition.key) {
              if (!extractedMetadata[condition.key]) {
                extractedMetadata[condition.key] = condition.expected || "0"
              }
            } else if (condition.type === "quest" && condition.quest_id) {
              if (!extractedQuests[condition.quest_id]) {
                extractedQuests[condition.quest_id] = condition.status || "not_started"
              }
            } else if ((condition.type === "item" || condition.type === "custom_item") && condition.item) {
              if (!extractedItems[condition.item]) {
                extractedItems[condition.item] = condition.amount || 1
              }
            }
          })
        }

        // Extract from question choices
        if (node.type === "question" && node.data.choices) {
          Object.values(node.data.choices).forEach((choice: any) => {
            if (choice.conditions) {
              Object.values(choice.conditions).forEach((condition: any) => {
                if (condition.type === "permission" && condition.value) {
                  if (!extractedPermissions.includes(condition.value)) {
                    extractedPermissions.push(condition.value)
                  }
                } else if (condition.type === "metadata" && condition.key) {
                  if (!extractedMetadata[condition.key]) {
                    extractedMetadata[condition.key] = condition.expected || "0"
                  }
                } else if (condition.type === "quest" && condition.quest_id) {
                  if (!extractedQuests[condition.quest_id]) {
                    extractedQuests[condition.quest_id] = condition.status || "not_started"
                  }
                } else if ((condition.type === "item" || condition.type === "custom_item") && condition.item) {
                  if (!extractedItems[condition.item]) {
                    extractedItems[condition.item] = condition.amount || 1
                  }
                }
              })
            }
          })
        }

        // Extract from messages (placeholders)
        if ((node.type === "message" || node.type === "question") && node.data.messages) {
          Object.values(node.data.messages).forEach((message: string) => {
            if (typeof message === "string") {
              // Extract %placeholder% format
              const placeholderRegex = /%([a-zA-Z0-9_]+)%/g
              let match
              while ((match = placeholderRegex.exec(message)) !== null) {
                const placeholder = match[1]
                if (!placeholders[placeholder]) {
                  setPlaceholders((prev) => ({ ...prev, [placeholder]: placeholder }))
                }
              }

              // Extract {placeholder} format
              const bracketRegex = /{([a-zA-Z0-9_]+)}/g
              while ((match = bracketRegex.exec(message)) !== null) {
                const placeholder = match[1]
                if (!placeholders[placeholder]) {
                  setPlaceholders((prev) => ({ ...prev, [placeholder]: placeholder }))
                }
              }
            }
          })
        }
      })

      // Update state with extracted values
      setMetadata(extractedMetadata)
      setPermissions(extractedPermissions)
      setQuests(extractedQuests)
      setItems(extractedItems)
    }
  }, [isOpen, nodes, placeholders])

  const startConversation = () => {
    // Find the root node
    const rootNodeId = tree.rootNodeId
    const rootNode = nodes.find((node) => node.id === rootNodeId)

    if (rootNode) {
      setCurrentNodeId(rootNodeId)
      processNode(rootNode)
      setIsConversationStarted(true)
      setActiveTab("conversation")
    } else {
      // Add error message to conversation history
      setConversationHistory([
        {
          type: "error",
          content: `No se encontró el nodo raíz con ID: ${rootNodeId}`,
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  const processNode = (node: Node) => {
    switch (node.type) {
      case "message":
        processMessageNode(node)
        break
      case "question":
        processQuestionNode(node)
        break
      case "action":
        processActionNode(node)
        break
      case "condition":
        processConditionNode(node)
        break
      default:
        // Add error message to conversation history
        setConversationHistory((prev) => [
          ...prev,
          {
            type: "error",
            content: `Tipo de nodo no soportado: ${node.type}`,
            timestamp: new Date().toISOString(),
          },
        ])
    }
  }

  const processMessageNode = (node: Node) => {
    // Get the message in the default language
    const message = node.data.messages?.default || node.data.messages?.es || "No message content"

    // Replace placeholders
    const processedMessage = replacePlaceholders(message)

    // Add message to conversation history
    setConversationHistory((prev) => [
      ...prev,
      {
        type: "npc",
        content: processedMessage,
        npcId: node.data.npcId || "unknown",
        timestamp: new Date().toISOString(),
      },
    ])

    // Process actions
    if (node.data.actions) {
      Object.entries(node.data.actions).forEach(([key, action]: [string, any]) => {
        processAction(action, key)
      })
    }

    // Check for auto-next
    if (node.data.autoNext) {
      // Find node by label instead of ID
      const nextNode = nodes.find((n) => (n.data.label || n.id) === node.data.autoNext)

      if (nextNode) {
        // Add a small delay to simulate the auto-next
        const delay = (node.data.autoNextDelay || 0) * 50 // Convert ticks to milliseconds (rough estimate)
        setTimeout(
          () => {
            setCurrentNodeId(nextNode.id)
            processNode(nextNode)
          },
          Math.max(1000, delay),
        ) // Minimum 1 second delay
      } else {
        // Add error message to conversation history
        setConversationHistory((prev) => [
          ...prev,
          {
            type: "error",
            content: `No se encontró el nodo siguiente con etiqueta: ${node.data.autoNext}`,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    } else {
      // If no auto-next, end the conversation
      setAvailableChoices([
        {
          id: "end",
          text: "Finalizar conversación",
          nextNode: "",
        },
      ])
    }
  }

  const processQuestionNode = (node: Node) => {
    // Get the message in the default language
    const message = node.data.messages?.default || node.data.messages?.es || "No message content"

    // Replace placeholders
    const processedMessage = replacePlaceholders(message)

    // Add message to conversation history
    setConversationHistory((prev) => [
      ...prev,
      {
        type: "npc",
        content: processedMessage,
        npcId: node.data.npcId || "unknown",
        timestamp: new Date().toISOString(),
      },
    ])

    // Process choices
    if (node.data.choices) {
      const choices: any[] = []

      Object.entries(node.data.choices).forEach(([key, choice]: [string, any]) => {
        // Check if the choice has conditions
        let choiceAvailable = true
        if (choice.conditions) {
          Object.entries(choice.conditions).forEach(([condKey, condition]: [string, any]) => {
            if (!evaluateCondition(condition)) {
              choiceAvailable = false
            }
          })
        }

        // Add choice to available choices
        choices.push({
          id: key,
          text: choice.texts?.default || choice.texts?.es || "No text",
          nextNode: choice.next_node || choice.nextNode || "",
          available: choiceAvailable,
          actions: choice.actions || {},
        })
      })

      setAvailableChoices(choices)
    } else {
      // If no choices, end the conversation
      setAvailableChoices([
        {
          id: "end",
          text: "Finalizar conversación",
          nextNode: "",
        },
      ])
    }
  }

  const processActionNode = (node: Node) => {
    // Process actions
    if (node.data.actions) {
      Object.entries(node.data.actions).forEach(([key, action]: [string, any]) => {
        processAction(action, key)
      })
    }

    // Check if this is an end node
    if (node.data.endNode) {
      // End the conversation
      setAvailableChoices([
        {
          id: "end",
          text: "Finalizar conversación",
          nextNode: "",
        },
      ])
    } else {
      // Find the next node using edges
      const outgoingEdges = edges.filter((edge) => edge.source === node.id)
      if (outgoingEdges.length > 0) {
        const nextNodeId = outgoingEdges[0].target
        const nextNode = nodes.find((n) => n.id === nextNodeId)

        if (nextNode) {
          setCurrentNodeId(nextNodeId)
          processNode(nextNode)
        } else {
          // Add error message to conversation history
          setConversationHistory((prev) => [
            ...prev,
            {
              type: "error",
              content: `No se encontró el nodo siguiente con ID: ${nextNodeId}`,
              timestamp: new Date().toISOString(),
            },
          ])
        }
      } else {
        // If no outgoing edges, end the conversation
        setAvailableChoices([
          {
            id: "end",
            text: "Finalizar conversación",
            nextNode: "",
          },
        ])
      }
    }
  }

  const processConditionNode = (node: Node) => {
    // Evaluate conditions
    let conditionResult = true
    if (node.data.conditions) {
      Object.entries(node.data.conditions).forEach(([key, condition]: [string, any]) => {
        if (!evaluateCondition(condition)) {
          conditionResult = false
        }
      })
    }

    // Add condition evaluation to conversation history
    setConversationHistory((prev) => [
      ...prev,
      {
        type: "system",
        content: `Evaluando condición: ${conditionResult ? "Verdadero" : "Falso"}`,
        timestamp: new Date().toISOString(),
      },
    ])

    // Navigate to the next node based on condition result using labels
    const nextNodeLabel = conditionResult ? node.data.trueNode : node.data.falseNode
    const nextNode = nodes.find((n) => (n.data.label || n.id) === nextNodeLabel)

    if (nextNode) {
      setCurrentNodeId(nextNode.id)
      processNode(nextNode)
    } else {
      // Add error message to conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          type: "error",
          content: `No se encontró el nodo siguiente con etiqueta: ${nextNodeLabel}`,
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  const evaluateCondition = (condition: any): boolean => {
    switch (condition.type) {
      case "permission":
        return permissions.includes(condition.value) === (condition.expected === true || condition.expected === "true")
      case "metadata":
        const metadataValue = metadata[condition.key] || "0"
        return compareValues(metadataValue, condition.expected, condition.operator || "==")
      case "level":
        return compareValues(placeholders.player_level, condition.value, condition.operator || ">=")
      case "money":
        return compareValues(money.toString(), condition.amount, condition.operator || ">=")
      case "item":
      case "custom_item":
        const itemAmount = items[condition.item] || 0
        switch (condition.check_type) {
          case "has":
            return itemAmount >= (condition.amount || 1)
          case "exact":
            return itemAmount === (condition.amount || 1)
          case "less":
            return itemAmount < (condition.amount || 1)
          default:
            return itemAmount >= (condition.amount || 1)
        }
      case "quest":
        return quests[condition.quest_id] === condition.status
      default:
        // Default to true for unsupported condition types
        return true
    }
  }

  const compareValues = (value1: string, value2: string, operator: string): boolean => {
    const num1 = Number.parseFloat(value1)
    const num2 = Number.parseFloat(value2)

    if (!isNaN(num1) && !isNaN(num2)) {
      // Numeric comparison
      switch (operator) {
        case ">=":
          return num1 >= num2
        case "<=":
          return num1 <= num2
        case "==":
          return num1 === num2
        case "!=":
          return num1 !== num2
        case ">":
          return num1 > num2
        case "<":
          return num1 < num2
        default:
          return num1 === num2
      }
    } else {
      // String comparison
      switch (operator) {
        case "equals":
          return value1 === value2
        case "not_equals":
          return value1 !== value2
        case "contains":
          return value1.includes(value2)
        case "starts_with":
          return value1.startsWith(value2)
        case "ends_with":
          return value1.endsWith(value2)
        default:
          return value1 === value2
      }
    }
  }

  const processAction = (action: any, actionKey: string) => {
    // Add action to conversation history
    setConversationHistory((prev) => [
      ...prev,
      {
        type: "action",
        content: `Ejecutando acción: ${action.type}`,
        details: action,
        timestamp: new Date().toISOString(),
      },
    ])

    // Process different action types
    switch (action.type) {
      case "give_money":
        const amount = Number.parseInt(action.value) || 0
        setMoney((prev) => prev + amount)
        break
      case "take_money":
        const amountToTake = Number.parseInt(action.value) || 0
        setMoney((prev) => Math.max(0, prev - amountToTake))
        break
      case "give_item":
      case "give_custom_item":
        const itemId = action.item || action.value?.split(":")[0] || "unknown_item"
        const itemAmount = Number.parseInt(action.amount) || Number.parseInt(action.value?.split(":")[1]) || 1
        setItems((prev) => ({
          ...prev,
          [itemId]: (prev[itemId] || 0) + itemAmount,
        }))
        break
      case "take_item":
      case "take_custom_item":
        const itemToTakeId = action.item || action.value?.split(":")[0] || "unknown_item"
        const itemToTakeAmount = Number.parseInt(action.amount) || Number.parseInt(action.value?.split(":")[1]) || 1
        setItems((prev) => ({
          ...prev,
          [itemToTakeId]: Math.max(0, (prev[itemToTakeId] || 0) - itemToTakeAmount),
        }))
        break
      case "set_metadata":
        setMetadata((prev) => ({
          ...prev,
          [action.key]: action.value,
        }))
        break
      case "increment_metadata":
        const currentValue = Number.parseInt(metadata[action.key] || "0") || 0
        const incrementValue = Number.parseInt(action.value) || 1
        setMetadata((prev) => ({
          ...prev,
          [action.key]: (currentValue + incrementValue).toString(),
        }))
        break
      case "start_quest":
        setQuests((prev) => ({
          ...prev,
          [action.quest_id]: "active",
        }))
        break
      case "complete_quest":
        setQuests((prev) => ({
          ...prev,
          [action.quest_id]: "completed",
        }))
        break
      case "cancel_quest":
        setQuests((prev) => ({
          ...prev,
          [action.quest_id]: "not_started",
        }))
        break
      case "message":
        // Add message to conversation history
        setConversationHistory((prev) => [
          ...prev,
          {
            type: "system",
            content: replacePlaceholders(action.value),
            timestamp: new Date().toISOString(),
          },
        ])
        break
      // Other action types can be added here
    }
  }

  const handleChoiceClick = (choice: any) => {
    // Add player choice to conversation history
    setConversationHistory((prev) => [
      ...prev,
      {
        type: "player",
        content: choice.text,
        timestamp: new Date().toISOString(),
      },
    ])

    // Process choice actions
    if (choice.actions) {
      Object.entries(choice.actions).forEach(([key, action]: [string, any]) => {
        processAction(action, key)
      })
    }

    // Navigate to the next node using label
    if (choice.nextNode && choice.nextNode !== "end") {
      const nextNode = nodes.find((n) => (n.data.label || n.id) === choice.nextNode)
      if (nextNode) {
        setCurrentNodeId(nextNode.id)
        processNode(nextNode)
      } else {
        // Add error message to conversation history
        setConversationHistory((prev) => [
          ...prev,
          {
            type: "error",
            content: `No se encontró el nodo siguiente con etiqueta: ${choice.nextNode}`,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    } else {
      // End the conversation
      setConversationHistory((prev) => [
        ...prev,
        {
          type: "system",
          content: "Conversación finalizada",
          timestamp: new Date().toISOString(),
        },
      ])
      setAvailableChoices([])
    }
  }

  const replacePlaceholders = (text: string): string => {
    if (!text) return ""

    // Replace %placeholder% format
    let result = text.replace(/%([a-zA-Z0-9_]+)%/g, (match, placeholder) => {
      return placeholders[placeholder] || match
    })

    // Replace {placeholder} format
    result = result.replace(/{([a-zA-Z0-9_]+)}/g, (match, placeholder) => {
      return placeholders[placeholder] || match
    })

    return result
  }

  const resetConversation = () => {
    setConversationHistory([])
    setAvailableChoices([])
    setIsConversationStarted(false)
    setCurrentNodeId("")
    setActiveTab("setup")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Probar Conversación: {tree.displayName}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup">Configuración</TabsTrigger>
            <TabsTrigger value="conversation">Conversación</TabsTrigger>
          </TabsList>

          <div className="flex-1 flex flex-col mt-4">
            <TabsContent value="setup" className="flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Placeholders</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[50vh]">
                      <div className="p-4 space-y-2">
                        {Object.entries(placeholders).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-2 gap-2">
                            <Label htmlFor={`placeholder-${key}`} className="text-xs">
                              {key}
                            </Label>
                            <Input
                              id={`placeholder-${key}`}
                              value={value}
                              onChange={(e) => setPlaceholders((prev) => ({ ...prev, [key]: e.target.value }))}
                              className="h-7 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Metadata</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[15vh]">
                        <div className="space-y-2">
                          {Object.entries(metadata).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-2 gap-2">
                              <Label htmlFor={`metadata-${key}`} className="text-xs">
                                {key}
                              </Label>
                              <Input
                                id={`metadata-${key}`}
                                value={value}
                                onChange={(e) => setMetadata((prev) => ({ ...prev, [key]: e.target.value }))}
                                className="h-7 text-xs"
                              />
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              const newKey = `custom_${Object.keys(metadata).length}`
                              setMetadata((prev) => ({ ...prev, [newKey]: "0" }))
                            }}
                          >
                            Añadir Metadata
                          </Button>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Permisos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[15vh]">
                        <div className="space-y-2">
                          {permissions.map((permission, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Switch
                                id={`permission-${index}`}
                                checked={permissions.includes(permission)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setPermissions((prev) => [...prev, permission])
                                  } else {
                                    setPermissions((prev) => prev.filter((p) => p !== permission))
                                  }
                                }}
                              />
                              <Label htmlFor={`permission-${index}`} className="text-xs">
                                {permission}
                              </Label>
                            </div>
                          ))}
                          <div className="flex items-center space-x-2 mt-2">
                            <Input
                              placeholder="Nuevo permiso"
                              className="h-7 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && e.currentTarget.value) {
                                  setPermissions((prev) => [...prev, e.currentTarget.value])
                                  e.currentTarget.value = ""
                                }
                              }}
                            />
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Dinero</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Input
                          type="number"
                          value={money}
                          onChange={(e) => setMoney(Number.parseInt(e.target.value) || 0)}
                          className="h-7 text-xs"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Items</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[10vh]">
                          <div className="space-y-2">
                            {Object.entries(items).map(([item, amount]) => (
                              <div key={item} className="grid grid-cols-2 gap-2">
                                <Label htmlFor={`item-${item}`} className="text-xs">
                                  {item}
                                </Label>
                                <Input
                                  id={`item-${item}`}
                                  type="number"
                                  value={amount}
                                  onChange={(e) =>
                                    setItems((prev) => ({ ...prev, [item]: Number.parseInt(e.target.value) || 0 }))
                                  }
                                  className="h-7 text-xs"
                                />
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => {
                                const newItem = `item_${Object.keys(items).length}`
                                setItems((prev) => ({ ...prev, [newItem]: 1 }))
                              }}
                            >
                              Añadir Item
                            </Button>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={startConversation}>Iniciar Conversación</Button>
              </div>
            </TabsContent>

            <TabsContent value="conversation" className="flex-1 flex flex-col">
              {!isConversationStarted ? (
                <div className="flex-1 flex items-center justify-center">
                  <Button onClick={startConversation}>Iniciar Conversación</Button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-4">
                        {conversationHistory.map((entry, index) => {
                          switch (entry.type) {
                            case "npc":
                              return (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-primary text-primary-foreground">
                                    <Bot className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                      {entry.npcId}{" "}
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                      </span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">{entry.content}</p>
                                  </div>
                                </div>
                              )
                            case "player":
                              return (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-blue-500 text-primary-foreground">
                                    <User className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                      Tú{" "}
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                      </span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">{entry.content}</p>
                                  </div>
                                </div>
                              )
                            case "action":
                              return (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-amber-500 text-primary-foreground">
                                    <Zap className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                      Acción{" "}
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                      </span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">{entry.content}</p>
                                    {entry.details && (
                                      <div className="mt-1 rounded-md bg-muted p-2">
                                        <pre className="text-xs">{JSON.stringify(entry.details, null, 2)}</pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            case "system":
                              return (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-slate-500 text-primary-foreground">
                                    <MessageSquare className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                      Sistema{" "}
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                      </span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">{entry.content}</p>
                                  </div>
                                </div>
                              )
                            case "error":
                              return (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-red-500 text-primary-foreground">
                                    <AlertCircle className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                      Error{" "}
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                      </span>
                                    </p>
                                    <p className="text-sm text-red-500">{entry.content}</p>
                                  </div>
                                </div>
                              )
                            default:
                              return null
                          }
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="p-4 border-t">
                    <div className="space-y-2">
                      {availableChoices.map((choice) => (
                        <Button
                          key={choice.id}
                          variant={choice.available === false ? "outline" : "default"}
                          className={`w-full justify-start ${
                            choice.available === false ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          onClick={() => choice.available !== false && handleChoiceClick(choice)}
                          disabled={choice.available === false}
                        >
                          <ArrowRight className="mr-2 h-4 w-4" />
                          {choice.text}
                        </Button>
                      ))}

                      {availableChoices.length === 0 && (
                        <Button variant="outline" className="w-full" onClick={resetConversation}>
                          Reiniciar Conversación
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
