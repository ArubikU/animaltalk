"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Plus, SaveIcon, Settings, Trash2 } from "lucide-react"
import { useState } from "react"
import type { Node } from "reactflow"

interface NodePropertiesPanelProps {
  nodeId: string
  onUpdate: (id: string, data: Record<string, any>) => void
  onDelete: (id: string) => void
  node: Node
}

export function NodePropertiesPanel({
  nodeId,
  onUpdate,
  onDelete,
  node,
}: NodePropertiesPanelProps) {


  const [activeTab, setActiveTab] = useState("basic")
  const [localData, setLocalData] = useState(node!.data)
  const save = () => {
    onUpdate(nodeId, localData)
  }

  const updateField = (field: string, value: any) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
  }

  const updateNestedField = (parent: string, field: string, value: any) => {
    const parentData = localData[parent] || {}
    const newParentData = { ...parentData, [field]: value }
    const newData = { ...localData, [parent]: newParentData }
    setLocalData(newData)

  }

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case "message":
        return "from-green-500 to-emerald-600"
      case "question":
        return "from-blue-500 to-indigo-600"
      case "action":
        return "from-amber-500 to-orange-600"
      case "condition":
        return "from-purple-500 to-violet-600"
      default:
        return "from-slate-500 to-gray-600"
    }
  }

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case "message":
        return "💬"
      case "question":
        return "❓"
      case "action":
        return "⚡"
      case "condition":
        return "🔀"
      default:
        return "📄"
    }
  }

  const addChoice = () => {
    const choices = localData.choices || {}
    const newKey = `choice_${Object.keys(choices).length + 1}`
    updateField("choices", {
      ...choices,
      [newKey]: {
        texts: { default: "Nueva opción" },
        trigger: (Object.keys(choices).length + 1).toString(),
        nextNode: "",
      },
    })
  }

  const removeChoice = (choiceKey: string) => {
    const choices = { ...localData.choices }
    delete choices[choiceKey]
    updateField("choices", choices)
  }

  const addAction = () => {
    const actions = localData.actions || {}
    const newKey = `action_${Object.keys(actions).length + 1}`
    updateField("actions", {
      ...actions,
      [newKey]: {
        type: "message",
        value: "",
      },
    })
  }

  const removeAction = (actionKey: string) => {
    const actions = { ...localData.actions }
    delete actions[actionKey]
    updateField("actions", actions)
  }

  const addCondition = () => {
    const conditions = localData.conditions || {}
    const newKey = `condition_${Object.keys(conditions).length + 1}`
    updateField("conditions", {
      ...conditions,
      [newKey]: {
        type: "permission",
        value: "",
        expected: true,
      },
    })
  }

  const removeCondition = (conditionKey: string) => {
    const conditions = { ...localData.conditions }
    delete conditions[conditionKey]
    updateField("conditions", conditions)
  }

  const getConditionFields = (conditionType: string) => {
    switch (conditionType) {
      case "permission":
        return { fields: ["value", "expected"], hasOperator: false, hasExpected: true }
      case "metadata":
        return { fields: ["key", "expected", "scope"], hasOperator: true, hasExpected: true }
      case "placeholder":
        return { fields: ["value", "expected"], hasOperator: true, hasExpected: true }
      case "event":
        return { fields: ["value", "expected"], hasOperator: false, hasExpected: true }
      case "level":
        return { fields: ["value"], hasOperator: true, hasExpected: false }
      case "world":
        return { fields: ["value", "expected"], hasOperator: false, hasExpected: true }
      case "time":
        return { fields: ["value"], hasOperator: false, hasExpected: false }
      case "weather":
        return { fields: ["value", "expected"], hasOperator: false, hasExpected: true }
      case "location":
        return { fields: ["location_type"], hasOperator: false, hasExpected: false, isSpecial: true }
      case "item":
        return { fields: ["item", "amount", "check_type"], hasOperator: false, hasExpected: false }
      case "custom_item":
        return { fields: ["item", "amount", "check_type"], hasOperator: false, hasExpected: false }
      case "money":
        return { fields: ["amount"], hasOperator: true, hasExpected: false }
      case "group":
        return { fields: ["value", "expected"], hasOperator: false, hasExpected: true }
      case "quest":
        return { fields: ["quest_id", "status"], hasOperator: false, hasExpected: false }
      case "kill_count":
        return { fields: ["mob_type", "amount"], hasOperator: true, hasExpected: false }
      case "conversation_count":
        return { fields: ["amount", "scope"], hasOperator: true, hasExpected: false }
      case "custom":
        return { fields: ["custom_type"], hasOperator: false, hasExpected: false, isSpecial: true }
      default:
        return { fields: ["value"], hasOperator: false, hasExpected: false }
    }
  }

  const getActionFields = (actionType: string) => {
    switch (actionType) {
      case "command":
        return { fields: ["value", "executor"] }
      case "console_command":
      case "player_command":
        return { fields: ["value"] }
      case "give_item":
      case "take_item":
        return { fields: ["value", "amount"] } // Format: MATERIAL:amount:name=Custom Name:lore=Line 1|Line 2
      case "give_custom_item":
      case "take_custom_item":
        return { fields: ["item", "amount", "silent"] }
      case "give_money":
      case "take_money":
        return { fields: ["value"] } // amount
      case "set_metadata":
        return { fields: ["key", "value", "scope"] }
      case "increment_metadata":
        return { fields: ["key", "value", "scope"] }
      case "start_quest":
      case "complete_quest":
      case "cancel_quest":
        return { fields: ["quest_id"] }
      case "increment_quest_progress":
        return { fields: ["quest_id", "progress_type", "amount"] }
      case "teleport":
        return { fields: ["location_type"], isSpecial: true }
      case "sound":
        return { fields: ["value", "volume", "pitch"] }
      case "message":
        return { fields: ["value"] }
      case "title":
        return { fields: ["title", "subtitle", "fade_in", "stay", "fade_out"] }
      case "effect":
        return { fields: ["effect", "duration", "amplifier"] }
      case "permission":
        return { fields: ["permission", "action"] }
      case "advancement":
        return { fields: ["value", "action"] }
      case "goto_node":
        return { fields: ["node_id"] }
      case "end_conversation":
        return { fields: [] } // No additional fields needed
      case "start_conversation":
        return { fields: ["npc_id", "tree_id"] }
      case "custom":
        return { fields: ["custom_type"], isSpecial: true }
      default:
        return { fields: ["value"] }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className={`p-6 border-b bg-gradient-to-r ${getNodeTypeColor(node.type!)} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getNodeTypeIcon(node.type!)}</div>
            <div>
              <h3 className="font-bold text-lg">{localData.label}</h3>
              <Badge variant="secondary" className="text-xs mt-1 bg-white/20 text-white border-white/30">
                {node.type}
              </Badge>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => onDelete(node.id)} className="bg-red-500 hover:bg-red-600">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={save} className="bg-blue-500 hover:bg-blue-600">
            <SaveIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-4 bg-slate-100">
          <TabsTrigger value="basic" className="data-[state=active]:bg-white">
            Básico
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-white">
            Avanzado
          </TabsTrigger>
          <TabsTrigger value="actions" className="data-[state=active]:bg-white">
            Acciones
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 max-h-[calc(100vh-200px)]">
          <div className="p-4 pr-2">
            <TabsContent value="basic" className="space-y-6">
              <Card className="p-4 border-slate-200 shadow-sm">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="label" className="text-sm font-semibold text-slate-700">
                      Etiqueta del Nodo
                    </Label>
                    <Input
                      id="label"
                      value={localData.label || ""}
                      onChange={(e) => updateField("label", e.target.value)}
                      className="border-slate-300 focus:border-blue-500"
                    />
                  </div>

                  {(node.type === "message" || node.type === "question") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="npcId" className="text-sm font-semibold text-slate-700">
                          ID del NPC
                        </Label>
                        <Input
                          id="npcId"
                          value={localData.npcId || ""}
                          onChange={(e) => updateField("npcId", e.target.value)}
                          className="border-slate-300 focus:border-blue-500"
                        />
                      </div>

                      {localData.conversation_keys ? (
                        <div className="space-y-2">
                          <Label htmlFor="conversationKeys">Claves de Conversación</Label>
                          <Textarea
                            id="conversationKeys"
                            value={localData.conversation_keys || ""}
                            onChange={(e) => updateField("conversation_keys", e.target.value)}
                            rows={2}
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-slate-700">Mensajes Multiidioma</Label>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="msg-default" className="text-xs text-slate-600 flex items-center gap-2">
                                🌐 Por defecto (fallback)
                              </Label>
                              <Textarea
                                id="msg-default"
                                value={localData.messages?.default || ""}
                                onChange={(e) => updateNestedField("messages", "default", e.target.value)}
                                rows={3}
                                className="border-slate-300 focus:border-blue-500"
                                placeholder="Mensaje por defecto (se muestra si no existe el idioma específico)..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="msg-es" className="text-xs text-slate-600 flex items-center gap-2">
                                🇪🇸 Español
                              </Label>
                              <Textarea
                                id="msg-es"
                                value={localData.messages?.es || ""}
                                onChange={(e) => updateNestedField("messages", "es", e.target.value)}
                                rows={3}
                                className="border-slate-300 focus:border-blue-500"
                                placeholder="Mensaje en español..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="msg-en" className="text-xs text-slate-600 flex items-center gap-2">
                                🇺🇸 Inglés
                              </Label>
                              <Textarea
                                id="msg-en"
                                value={localData.messages?.en || ""}
                                onChange={(e) => updateNestedField("messages", "en", e.target.value)}
                                rows={3}
                                className="border-slate-300 focus:border-blue-500"
                                placeholder="Message in English..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="msg-fr" className="text-xs text-slate-600 flex items-center gap-2">
                                🇫🇷 Francés
                              </Label>
                              <Textarea
                                id="msg-fr"
                                value={localData.messages?.fr || ""}
                                onChange={(e) => updateNestedField("messages", "fr", e.target.value)}
                                rows={3}
                                className="border-slate-300 focus:border-blue-500"
                                placeholder="Message en français..."
                              />
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                            💡 <strong>Tip:</strong> El mensaje "Por defecto" se mostrará cuando el idioma del jugador no tenga una traducción específica.
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="pitch" className="text-sm font-semibold text-slate-700">
                          Tono de Voz
                        </Label>
                        <Input
                          id="pitch"
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={localData.pitch || 0.4}
                          onChange={(e) => updateField("pitch", Number.parseFloat(e.target.value))}
                          className="border-slate-300 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {node.type === "question" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Opciones de Respuesta</Label>
                        <Button size="sm" variant="outline" onClick={addChoice}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(localData.choices || {}).map(([key, choice]: [string, any]) => (
                          <Card key={key} className="p-3 border-l-4 border-l-blue-500">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-blue-700">{key}</Label>
                                <Button size="sm" variant="ghost" onClick={() => removeChoice(key)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Basic choice properties */}
                              <div className="space-y-2">
                                <Input
                                  placeholder="Texto por defecto (fallback)"
                                  value={choice.texts?.default || ""}
                                  onChange={(e) => {
                                    const choices = { ...localData.choices }
                                    choices[key] = {
                                      ...choices[key],
                                      texts: { ...choices[key].texts, default: e.target.value },
                                    }
                                    updateField("choices", choices)
                                  }}
                                />
                                <Input
                                  placeholder="Texto en español"
                                  value={choice.texts?.es || ""}
                                  onChange={(e) => {
                                    const choices = { ...localData.choices }
                                    choices[key] = {
                                      ...choices[key],
                                      texts: { ...choices[key].texts, es: e.target.value },
                                    }
                                    updateField("choices", choices)
                                  }}
                                />
                                <Input
                                  placeholder="Texto en inglés"
                                  value={choice.texts?.en || ""}
                                  onChange={(e) => {
                                    const choices = { ...localData.choices }
                                    choices[key] = {
                                      ...choices[key],
                                      texts: { ...choices[key].texts, en: e.target.value },
                                    }
                                    updateField("choices", choices)
                                  }}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    placeholder="Trigger"
                                    value={choice.trigger || ""}
                                    onChange={(e) => {
                                      const choices = { ...localData.choices }
                                      choices[key] = { ...choices[key], trigger: e.target.value }
                                      updateField("choices", choices)
                                    }}
                                  />
                                  <Select
                                    value={choice.next_node || choice.nextNode || ""}
                                    onValueChange={(value) => {
                                      const choices = { ...localData.choices }
                                      choices[key] = {
                                        ...choices[key],
                                        next_node: value,
                                        nextNode: value,
                                      }
                                      updateField("choices", choices)
                                    }}
                                  >
                                    <Input
                                      placeholder="ID del siguiente nodo"
                                      value={choice.next_node || choice.nextNode || ""}
                                      onChange={(e) => {
                                        const choices = { ...localData.choices }
                                        choices[key] = {
                                          ...choices[key],
                                          next_node: e.target.value,
                                          nextNode: e.target.value,
                                        }
                                        updateField("choices", choices)
                                      }}
                                    />
                                  </Select>
                                </div>
                              </div>

                              {/* Conditions for this choice */}
                              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-xs font-medium text-purple-700">
                                    🔒 Condiciones para mostrar esta opción
                                  </Label>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs"
                                    onClick={() => {
                                      const choices = { ...localData.choices }
                                      const conditions = choices[key].conditions || {}
                                      const newConditionKey = `condition_${Object.keys(conditions).length + 1}`
                                      choices[key] = {
                                        ...choices[key],
                                        conditions: {
                                          ...conditions,
                                          [newConditionKey]: {
                                            type: "permission",
                                            value: "",
                                            expected: true,
                                          },
                                        },
                                      }
                                      updateField("choices", choices)
                                    }}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Condición
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  {Object.entries(choice.conditions || {}).map(
                                    ([condKey, condition]: [string, any]) => (
                                      <div key={condKey} className="bg-white p-2 rounded border border-purple-300">
                                        <div className="flex items-center justify-between mb-2">
                                          <Label className="text-xs text-purple-600">{condKey}</Label>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 w-5 p-0"
                                            onClick={() => {
                                              const choices = { ...localData.choices }
                                              const conditions = { ...choices[key].conditions }
                                              delete conditions[condKey]
                                              choices[key] = { ...choices[key], conditions }
                                              updateField("choices", choices)
                                            }}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                        <div className="space-y-1">
                                          {(() => {
                                            const conditionConfig = getConditionFields(condition.type || "permission")

                                            return (
                                              <>
                                                <Select
                                                  value={condition.type || "permission"}
                                                  onValueChange={(value) => {
                                                    const choices = { ...localData.choices }
                                                    choices[key].conditions[condKey] = { type: value }
                                                    updateField("choices", choices)
                                                  }}
                                                >
                                                  <SelectTrigger className="h-7 text-xs">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="permission">Permission</SelectItem>
                                                    <SelectItem value="metadata">Metadata</SelectItem>
                                                    <SelectItem value="placeholder">Placeholder</SelectItem>
                                                    <SelectItem value="event">Event</SelectItem>
                                                    <SelectItem value="level">Level</SelectItem>
                                                    <SelectItem value="world">World</SelectItem>
                                                    <SelectItem value="time">Time</SelectItem>
                                                    <SelectItem value="weather">Weather</SelectItem>
                                                    <SelectItem value="location">Location</SelectItem>
                                                    <SelectItem value="item">Item</SelectItem>
                                                    <SelectItem value="custom_item">Custom Item</SelectItem>
                                                    <SelectItem value="money">Money</SelectItem>
                                                    <SelectItem value="group">Group</SelectItem>
                                                    <SelectItem value="quest">Quest</SelectItem>
                                                    <SelectItem value="kill_count">Kill Count</SelectItem>
                                                    <SelectItem value="conversation_count">
                                                      Conversation Count
                                                    </SelectItem>
                                                    <SelectItem value="custom">Custom</SelectItem>
                                                  </SelectContent>
                                                </Select>

                                                {/* Campos dinámicos basados en el tipo */}
                                                {conditionConfig.fields.includes("value") && (
                                                  <Input
                                                    placeholder="Valor"
                                                    className="h-7 text-xs"
                                                    value={condition.value || ""}
                                                    onChange={(e) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        value: e.target.value,
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  />
                                                )}

                                                {conditionConfig.fields.includes("key") && (
                                                  <Input
                                                    placeholder="Clave de metadata"
                                                    className="h-7 text-xs"
                                                    value={condition.key || ""}
                                                    onChange={(e) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        key: e.target.value,
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  />
                                                )}

                                                {conditionConfig.fields.includes("quest_id") && (
                                                  <Input
                                                    placeholder="ID de la quest"
                                                    className="h-7 text-xs"
                                                    value={condition.quest_id || ""}
                                                    onChange={(e) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        quest_id: e.target.value,
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  />
                                                )}

                                                {conditionConfig.fields.includes("status") && (
                                                  <Select
                                                    value={condition.status || "completed"}
                                                    onValueChange={(value) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = { ...condition, status: value }
                                                      updateField("choices", choices)
                                                    }}
                                                  >
                                                    <SelectTrigger className="h-7 text-xs">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="completed">Completed</SelectItem>
                                                      <SelectItem value="active">Active</SelectItem>
                                                      <SelectItem value="not_started">Not Started</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                )}

                                                {conditionConfig.fields.includes("mob_type") && (
                                                  <Input
                                                    placeholder="Tipo de mob"
                                                    className="h-7 text-xs"
                                                    value={condition.mob_type || ""}
                                                    onChange={(e) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        mob_type: e.target.value,
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  />
                                                )}

                                                {conditionConfig.fields.includes("amount") && (
                                                  <Input
                                                    placeholder="Cantidad"
                                                    className="h-7 text-xs"
                                                    type="number"
                                                    value={condition.amount || ""}
                                                    onChange={(e) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        amount: Number(e.target.value),
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  />
                                                )}

                                                {conditionConfig.fields.includes("item") && (
                                                  <Input
                                                    placeholder="ID del item"
                                                    className="h-7 text-xs"
                                                    value={condition.item || ""}
                                                    onChange={(e) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        item: e.target.value,
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  />
                                                )}

                                                {conditionConfig.fields.includes("check_type") && (
                                                  <Select
                                                    value={condition.check_type || "has"}
                                                    onValueChange={(value) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        check_type: value,
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  >
                                                    <SelectTrigger className="h-7 text-xs">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="has">Has</SelectItem>
                                                      <SelectItem value="exact">Exact</SelectItem>
                                                      <SelectItem value="less">Less</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                )}

                                                {conditionConfig.fields.includes("location_type") && (
                                                  <Select
                                                    value={condition.location_type || "coordinates"}
                                                    onValueChange={(value) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        location_type: value,
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  >
                                                    <SelectTrigger className="h-7 text-xs">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="spawn">Spawn</SelectItem>
                                                      <SelectItem value="coordinates">Coordinates</SelectItem>
                                                      <SelectItem value="biome">Biome</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                )}

                                                {condition.location_type === "coordinates" && (
                                                  <div className="grid grid-cols-3 gap-1">
                                                    <Input
                                                      placeholder="X"
                                                      className="h-7 text-xs"
                                                      type="number"
                                                      value={condition.x || ""}
                                                      onChange={(e) => {
                                                        const choices = { ...localData.choices }
                                                        choices[key].conditions[condKey] = {
                                                          ...condition,
                                                          x: Number(e.target.value),
                                                        }
                                                        updateField("choices", choices)
                                                      }}
                                                    />
                                                    <Input
                                                      placeholder="Y"
                                                      className="h-7 text-xs"
                                                      type="number"
                                                      value={condition.y || ""}
                                                      onChange={(e) => {
                                                        const choices = { ...localData.choices }
                                                        choices[key].conditions[condKey] = {
                                                          ...condition,
                                                          y: Number(e.target.value),
                                                        }
                                                        updateField("choices", choices)
                                                      }}
                                                    />
                                                    <Input
                                                      placeholder="Z"
                                                      className="h-7 text-xs"
                                                      type="number"
                                                      value={condition.z || ""}
                                                      onChange={(e) => {
                                                        const choices = { ...localData.choices }
                                                        choices[key].conditions[condKey] = {
                                                          ...condition,
                                                          z: Number(e.target.value),
                                                        }
                                                        updateField("choices", choices)
                                                      }}
                                                    />
                                                    <Input
                                                      placeholder="World"
                                                      className="h-7 text-xs col-span-3"
                                                      value={condition.world || ""}
                                                      onChange={(e) => {
                                                        const choices = { ...localData.choices }
                                                        choices[key].conditions[condKey] = {
                                                          ...condition,
                                                          world: e.target.value,
                                                        }
                                                        updateField("choices", choices)
                                                      }}
                                                    />
                                                  </div>
                                                )}

                                                {(condition.location_type === "coordinates" ||
                                                  condition.location_type === "spawn") && (
                                                  <Input
                                                    placeholder="Radio"
                                                    className="h-7 text-xs"
                                                    type="number"
                                                    value={condition.radius || ""}
                                                    onChange={(e) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        radius: Number(e.target.value),
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  />
                                                )}

                                                {condition.location_type === "biome" && (
                                                  <Input
                                                    placeholder="Nombre del bioma"
                                                    className="h-7 text-xs"
                                                    value={condition.biome || ""}
                                                    onChange={(e) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        biome: e.target.value,
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  />
                                                )}

                                                {conditionConfig.fields.includes("custom_type") && (
                                                  <Select
                                                    value={condition.custom_type || "first_conversation"}
                                                    onValueChange={(value) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        custom_type: value,
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  >
                                                    <SelectTrigger className="h-7 text-xs">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="first_conversation">
                                                        First Conversation
                                                      </SelectItem>
                                                      <SelectItem value="completed_quest">Completed Quest</SelectItem>
                                                      <SelectItem value="has_achievement">Has Achievement</SelectItem>
                                                      <SelectItem value="daily_limit">Daily Limit</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                )}

                                                {conditionConfig.fields.includes("scope") && (
                                                  <Select
                                                    value={condition.scope || "player_global"}
                                                    onValueChange={(value) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = { ...condition, scope: value }
                                                      updateField("choices", choices)
                                                    }}
                                                  >
                                                    <SelectTrigger className="h-7 text-xs">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="player_global">Player Global</SelectItem>
                                                      <SelectItem value="player_npc">Player-NPC</SelectItem>
                                                      <SelectItem value="npc_global">NPC Global</SelectItem>
                                                      {condition.type === "conversation_count" && (
                                                        <>
                                                          <SelectItem value="npc">NPC</SelectItem>
                                                          <SelectItem value="total">Total</SelectItem>
                                                          <SelectItem value="today">Today</SelectItem>
                                                        </>
                                                      )}
                                                    </SelectContent>
                                                  </Select>
                                                )}

                                                {conditionConfig.hasExpected && (
                                                  <div className="grid grid-cols-2 gap-1">
                                                    <Label className="text-xs text-slate-600 col-span-2">
                                                      Valor esperado:
                                                    </Label>
                                                    <Input
                                                      placeholder="Expected"
                                                      className="h-7 text-xs col-span-2"
                                                      value={condition.expected || ""}
                                                      onChange={(e) => {
                                                        const choices = { ...localData.choices }
                                                        choices[key].conditions[condKey] = {
                                                          ...condition,
                                                          expected: e.target.value,
                                                        }
                                                        updateField("choices", choices)
                                                      }}
                                                    />
                                                  </div>
                                                )}

                                                {conditionConfig.hasOperator && (
                                                  <Select
                                                    value={condition.operator || ">="}
                                                    onValueChange={(value) => {
                                                      const choices = { ...localData.choices }
                                                      choices[key].conditions[condKey] = {
                                                        ...condition,
                                                        operator: value,
                                                      }
                                                      updateField("choices", choices)
                                                    }}
                                                  >
                                                    <SelectTrigger className="h-7 text-xs">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value=">=">&gt;=</SelectItem>
                                                      <SelectItem value="<=">&lt;=</SelectItem>
                                                      <SelectItem value="==">=</SelectItem>
                                                      <SelectItem value="!=">&ne;</SelectItem>
                                                      <SelectItem value=">">&gt;</SelectItem>
                                                      <SelectItem value="<">&lt;</SelectItem>
                                                      <SelectItem value="equals">equals</SelectItem>
                                                      <SelectItem value="not_equals">not_equals</SelectItem>
                                                      <SelectItem value="contains">contains</SelectItem>
                                                      <SelectItem value="starts_with">starts_with</SelectItem>
                                                      <SelectItem value="ends_with">ends_with</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                )}
                                              </>
                                            )
                                          })()}
                                        </div>
                                      </div>
                                    ),
                                  )}

                                  {Object.keys(choice.conditions || {}).length === 0 && (
                                    <div className="text-xs text-purple-500 italic text-center py-2">
                                      Sin condiciones - la opción siempre se muestra
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Actions for this choice */}
                              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-xs font-medium text-amber-700">
                                    ⚡ Acciones al seleccionar esta opción
                                  </Label>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs"
                                    onClick={() => {
                                      const choices = { ...localData.choices }
                                      const actions = choices[key].actions || {}
                                      const newActionKey = `action_${Object.keys(actions).length + 1}`
                                      choices[key] = {
                                        ...choices[key],
                                        actions: {
                                          ...actions,
                                          [newActionKey]: {
                                            type: "message",
                                            value: "",
                                          },
                                        },
                                      }
                                      updateField("choices", choices)
                                    }}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Acción
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  {Object.entries(choice.actions || {}).map(([actionKey, action]: [string, any]) => (
                                    <div key={actionKey} className="bg-white p-2 rounded border border-amber-300">
                                      <div className="flex items-center justify-between mb-2">
                                        <Label className="text-xs text-amber-600">{actionKey}</Label>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-5 w-5 p-0"
                                          onClick={() => {
                                            const choices = { ...localData.choices }
                                            const actions = { ...choices[key].actions }
                                            delete actions[actionKey]
                                            choices[key] = { ...choices[key], actions }
                                            updateField("choices", choices)
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>

                                      <div className="space-y-1">
                                        <Select
                                          value={action.type || "message"}
                                          onValueChange={(value) => {
                                            const choices = { ...localData.choices }
                                            choices[key].actions[actionKey] = { ...action, type: value }
                                            updateField("choices", choices)
                                          }}
                                        >
                                          <SelectTrigger className="h-7 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="command">Command</SelectItem>
                                            <SelectItem value="console_command">Console Command</SelectItem>
                                            <SelectItem value="player_command">Player Command</SelectItem>
                                            <SelectItem value="give_item">Give Item</SelectItem>
                                            <SelectItem value="give_custom_item">Give Custom Item</SelectItem>
                                            <SelectItem value="take_item">Take Item</SelectItem>
                                            <SelectItem value="take_custom_item">Take Custom Item</SelectItem>
                                            <SelectItem value="give_money">Give Money</SelectItem>
                                            <SelectItem value="take_money">Take Money</SelectItem>
                                            <SelectItem value="set_metadata">Set Metadata</SelectItem>
                                            <SelectItem value="increment_metadata">Increment Metadata</SelectItem>
                                            <SelectItem value="start_quest">Start Quest</SelectItem>
                                            <SelectItem value="complete_quest">Complete Quest</SelectItem>
                                            <SelectItem value="cancel_quest">Cancel Quest</SelectItem>
                                            <SelectItem value="increment_quest_progress">
                                              Increment Quest Progress
                                            </SelectItem>
                                            <SelectItem value="teleport">Teleport</SelectItem>
                                            <SelectItem value="sound">Sound</SelectItem>
                                            <SelectItem value="message">Message</SelectItem>
                                            <SelectItem value="title">Title</SelectItem>
                                            <SelectItem value="effect">Effect</SelectItem>
                                            <SelectItem value="permission">Permission</SelectItem>
                                            <SelectItem value="advancement">Advancement</SelectItem>
                                            <SelectItem value="goto_node">Goto Node</SelectItem>
                                            <SelectItem value="end_conversation">End Conversation</SelectItem>
                                            <SelectItem value="start_conversation">Start Conversation</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Textarea
                                          placeholder="Valor de la acción"
                                          className="h-16 text-xs"
                                          value={action.value || ""}
                                          onChange={(e) => {
                                            const choices = { ...localData.choices }
                                            choices[key].actions[actionKey] = { ...action, value: e.target.value }
                                            updateField("choices", choices)
                                          }}
                                          rows={2}
                                        />
                                      </div>
                                    </div>
                                  ))}

                                  {Object.keys(choice.actions || {}).length === 0 && (
                                    <div className="text-xs text-amber-500 italic text-center py-2">
                                      Sin acciones - solo navega al siguiente nodo
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {node.type === "message" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="autoNext">Auto-siguiente nodo</Label>
                        <Input
                          id="autoNext"
                          value={localData.autoNext || ""}
                          onChange={(e) => updateField("autoNext", e.target.value)}
                          placeholder="ID del siguiente nodo"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="autoNextDelay">Retraso (ticks)</Label>
                        <Input
                          id="autoNextDelay"
                          type="number"
                          value={localData.autoNextDelay || 0}
                          onChange={(e) => updateField("autoNextDelay", Number.parseInt(e.target.value))}
                        />
                      </div>
                    </>
                  )}

                  {node.type === "condition" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="trueNode">Nodo si es verdadero</Label>
                        <Input
                          id="trueNode"
                          value={localData.trueNode || ""}
                          onChange={(e) => updateField("trueNode", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="falseNode">Nodo si es falso</Label>
                        <Input
                          id="falseNode"
                          value={localData.falseNode || ""}
                          onChange={(e) => updateField("falseNode", e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {node.type === "action" && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="endNode"
                        checked={localData.endNode || false}
                        onCheckedChange={(checked) => updateField("endNode", checked)}
                      />
                      <Label htmlFor="endNode">Nodo final</Label>
                    </div>
                  )}

                  {node.type === "end" && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="endNode"
                        checked={localData.endNode || false}
                        onCheckedChange={(checked) => updateField("endNode", checked)}
                      />
                      <Label htmlFor="endNode">Nodo final</Label>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Other tabs content with improved styling */}
            <TabsContent value="advanced" className="space-y-4">
              <Card className="p-4 border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <Label className="text-sm font-semibold text-slate-700">Configuración Avanzada</Label>
                </div>
                {(node.type === "condition" || node.type === "question") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Condiciones del Nodo</Label>
                      <Button size="sm" variant="outline" onClick={addCondition}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {Object.entries(localData.conditions || {}).map(([key, condition]: [string, any]) => (
                        <Card key={key} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium">{key}</Label>
                              <Button size="sm" variant="ghost" onClick={() => removeCondition(key)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              {(() => {
                                const conditionConfig = getConditionFields(condition.type || "permission")

                                return (
                                  <>
                                    <Select
                                      value={condition.type || "permission"}
                                      onValueChange={(value) => {
                                        const conditions = { ...localData.conditions }
                                        conditions[key] = { type: value }
                                        updateField("conditions", conditions)
                                      }}
                                    >
                                      <SelectTrigger className="h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="permission">Permission</SelectItem>
                                        <SelectItem value="metadata">Metadata</SelectItem>
                                        <SelectItem value="placeholder">Placeholder</SelectItem>
                                        <SelectItem value="event">Event</SelectItem>
                                        <SelectItem value="level">Level</SelectItem>
                                        <SelectItem value="world">World</SelectItem>
                                        <SelectItem value="time">Time</SelectItem>
                                        <SelectItem value="weather">Weather</SelectItem>
                                        <SelectItem value="location">Location</SelectItem>
                                        <SelectItem value="item">Item</SelectItem>
                                        <SelectItem value="custom_item">Custom Item</SelectItem>
                                        <SelectItem value="money">Money</SelectItem>
                                        <SelectItem value="group">Group</SelectItem>
                                        <SelectItem value="quest">Quest</SelectItem>
                                        <SelectItem value="kill_count">Kill Count</SelectItem>
                                        <SelectItem value="conversation_count">Conversation Count</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    {/* Campos dinámicos basados en el tipo */}
                                    {conditionConfig.fields.includes("value") && (
                                      <Input
                                        placeholder="Valor"
                                        className="h-7 text-xs"
                                        value={condition.value || ""}
                                        onChange={(e) => {
                                          const conditions = { ...localData.conditions }
                                          conditions[key] = { ...condition, value: e.target.value }
                                          updateField("conditions", conditions)
                                        }}
                                      />
                                    )}

                                    {conditionConfig.fields.includes("key") && (
                                      <Input
                                        placeholder="Clave de metadata"
                                        className="h-7 text-xs"
                                        value={condition.key || ""}
                                        onChange={(e) => {
                                          const conditions = { ...localData.conditions }
                                          conditions[key] = { ...condition, key: e.target.value }
                                          updateField("conditions", conditions)
                                        }}
                                      />
                                    )}

                                    {conditionConfig.fields.includes("quest_id") && (
                                      <Input
                                        placeholder="ID de la quest"
                                        className="h-7 text-xs"
                                        value={condition.quest_id || ""}
                                        onChange={(e) => {
                                          const conditions = { ...localData.conditions }
                                          conditions[key] = { ...condition, quest_id: e.target.value }
                                          updateField("conditions", conditions)
                                        }}
                                      />
                                    )}

                                    {conditionConfig.fields.includes("status") && (
                                      <Select
                                        value={condition.status || "completed"}
                                        onValueChange={(value) => {
                                          const conditions = { ...localData.conditions }
                                          conditions[key] = { ...condition, status: value }
                                          updateField("conditions", conditions)
                                        }}
                                      >
                                        <SelectTrigger className="h-7 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="active">Active</SelectItem>
                                          <SelectItem value="not_started">Not Started</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}

                                    {conditionConfig.fields.includes("mob_type") && (
                                      <Input
                                        placeholder="Tipo de mob"
                                        className="h-7 text-xs"
                                        value={condition.mob_type || ""}
                                        onChange={(e) => {
                                          const conditions = { ...localData.conditions }
                                          conditions[key] = { ...condition, mob_type: e.target.value }
                                          updateField("conditions", conditions)
                                        }}
                                      />
                                    )}

                                    {conditionConfig.fields.includes("amount") && (
                                      <Input
                                        placeholder="Cantidad"
                                        className="h-7 text-xs"
                                        type="number"
                                        value={condition.amount || ""}
                                        onChange={(e) => {
                                          const conditions = { ...localData.conditions }
                                          conditions[key] = { ...condition, amount: Number(e.target.value) }
                                          updateField("conditions", conditions)
                                        }}
                                      />
                                    )}

                                    {conditionConfig.fields.includes("item") && (
                                      <Input
                                        placeholder="ID del item"
                                        className="h-7 text-xs"
                                        value={condition.item || ""}
                                        onChange={(e) => {
                                          const conditions = { ...localData.conditions }
                                          conditions[key] = { ...condition, item: e.target.value }
                                          updateField("conditions", conditions)
                                        }}
                                      />
                                    )}

                                    {conditionConfig.fields.includes("check_type") && (
                                      <Select
                                        value={condition.check_type || "has"}
                                        onValueChange={(value) => {
                                          const conditions = { ...localData.conditions }
                                          conditions[key] = { ...condition, check_type: value }
                                          updateField("conditions", conditions)
                                        }}
                                      >
                                        <SelectTrigger className="h-7 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="has">Has</SelectItem>
                                          <SelectItem value="exact">Exact</SelectItem>
                                          <SelectItem value="less">Less</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}

                                    {conditionConfig.fields.includes("location_type") && (
                                      <Select
                                        value={condition.location_type || "coordinates"}
                                        onValueChange={(value) => {
                                          const conditions = { ...localData.conditions }
                                          conditions[key] = { ...condition, location_type: value }
                                          updateField("conditions", conditions)
                                        }}
                                      >
                                        <SelectTrigger className="h-7 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="spawn">Spawn</SelectItem>
                                          <SelectItem value="coordinates">Coordinates</SelectItem>
                                          <SelectItem value="biome">Biome</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}

                                    {condition.location_type === "coordinates" && (
                                      <div className="grid grid-cols-3 gap-1">
                                        <Input
                                          placeholder="X"
                                          className="h-7 text-xs"
                                          type="number"                                          value={condition.x || ""}
                                          onChange={(e) => {
                                            const conditions = { ...localData.conditions }
                                            conditions[key] = { ...condition, x: Number(e.target.value) }
                                            updateField("conditions", conditions)
                                          }}
                                        />
                                        <Input
                                          placeholder="Y"
                                          className="h-7 text-xs"
                                          type="number"
                                          value={condition.y || ""}
                                          onChange={(e) => {
                                            const conditions = { ...localData.conditions }
                                            conditions[key] = { ...condition, y: Number(e.target.value) }
                                            updateField("conditions", conditions)
                                          }}
                                        />
                                        <Input
                                          placeholder="Z"
                                          className="h-7 text-xs"
                                          type="number"
                                          value={condition.z || ""}
                                          onChange={(e) => {
                                            const conditions = { ...localData.conditions }
                                            conditions[key] = { ...condition, z: Number(e.target.value) }
                                            updateField("conditions", conditions)
                                          }}
                                        />
                                      </div>
                                    )}
                                    <Separator className="my-2" />
                                    {conditionConfig.hasExpected && (
                                      <Input
                                        placeholder="Valor esperado"
                                        className="h-7 text-xs"
                                        value={condition.expected || ""}
                                        onChange={(e) => {
                                          const conditions = { ...localData.conditions }
                                          conditions[key] = { ...condition, expected: e.target.value }
                                          updateField("conditions", conditions)
                                        }}
                                      />
                                    )}
                                    {conditionConfig.hasOperator && (
                                      <Select
                                        value={condition.operator || ">="}
                                        onValueChange={(value) => {
                                          const conditions = { ...localData.conditions }
                                          conditions[key] = { ...condition, operator: value }
                                          updateField("conditions", conditions)
                                        }}
                                      >
                                        <SelectTrigger className="h-7 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value=">=">&gt;=</SelectItem>
                                          <SelectItem value="<=">&lt;=</SelectItem>
                                          <SelectItem value="==">=</SelectItem>
                                          <SelectItem value="!=">&ne;</SelectItem>
                                          <SelectItem value=">">&gt;</SelectItem>
                                          <SelectItem value="<">&lt;</SelectItem>
                                          <SelectItem value="equals">equals</SelectItem>
                                          <SelectItem value="not_equals">not_equals</SelectItem>
                                          <SelectItem value="contains">contains</SelectItem>
                                          <SelectItem value="starts_with">starts_with</SelectItem>
                                          <SelectItem value="ends_with">ends_with</SelectItem>
                                        </SelectContent>
                                      </Select>                                    )}
                                    <Separator className="my-2" />
                                  </>
                                )})()}
                                <Separator className="my-2" />
                              <Separator className="my-2" />
                              <div className="flex items-center justify-between">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const conditions = { ...localData.conditions }
                                    const newConditionKey = `condition_${Object.keys(conditions).length + 1}`
                                    conditions[newConditionKey] = { type: "permission", value: "" }
                                    updateField("conditions", conditions)
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                  Añadir Condición
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const conditions = { ...localData.conditions }
                                    delete conditions[key]
                                    updateField("conditions", conditions)
                                  }}
                                >
                                  
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                <Separator className="my-2" />
                              </div>
                              <Separator className="my-2" />
                            </div>
                            <Separator className="my-2" />
                          </div>
                        </Card>
                      ))}
                    </div>
                    <Separator className="my-2" />
                    </div>
                  )}
                    </Card>
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4">
                    <Card className="p-4 border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="w-4 h-4 text-amber-600" />
                      <Label className="text-sm font-semibold text-amber-700">Acciones del Nodo</Label>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                      <Label>Acciones</Label>
                      <Button size="sm" variant="outline" onClick={addAction}>
                        <Plus className="w-4 h-4" />
                      </Button>
                      </div>
                      <div className="space-y-2">
                      {Object.entries(localData.actions || {}).map(([key, action]: [string, any]) => (
                        <Card key={key} className="p-3 border-l-4 border-l-amber-500">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-amber-700">{key}</Label>
                          <Button size="sm" variant="ghost" onClick={() => removeAction(key)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          </div>
                          <div className="space-y-1">
                          <Select
                            value={action.type || "message"}
                            onValueChange={(value) => {
                            const actions = { ...localData.actions }
                            actions[key] = { ...action, type: value }
                            updateField("actions", actions)
                            }}
                          >
                            <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="command">Command</SelectItem>
                            <SelectItem value="console_command">Console Command</SelectItem>
                            <SelectItem value="player_command">Player Command</SelectItem>
                            <SelectItem value="give_item">Give Item</SelectItem>
                            <SelectItem value="give_custom_item">Give Custom Item</SelectItem>
                            <SelectItem value="take_item">Take Item</SelectItem>
                            <SelectItem value="take_custom_item">Take Custom Item</SelectItem>
                            <SelectItem value="give_money">Give Money</SelectItem>
                            <SelectItem value="take_money">Take Money</SelectItem>
                            <SelectItem value="set_metadata">Set Metadata</SelectItem>
                            <SelectItem value="increment_metadata">Increment Metadata</SelectItem>
                            <SelectItem value="start_quest">Start Quest</SelectItem>
                            <SelectItem value="complete_quest">Complete Quest</SelectItem>
                            <SelectItem value="cancel_quest">Cancel Quest</SelectItem>
                            <SelectItem value="increment_quest_progress">Increment Quest Progress</SelectItem>
                            <SelectItem value="teleport">Teleport</SelectItem>
                            <SelectItem value="sound">Sound</SelectItem>
                            <SelectItem value="message">Message</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="effect">Effect</SelectItem>
                            <SelectItem value="permission">Permission</SelectItem>
                            <SelectItem value="advancement">Advancement</SelectItem>
                            <SelectItem value="goto_node">Goto Node</SelectItem>
                            <SelectItem value="end_conversation">End Conversation</SelectItem>
                            <SelectItem value="start_conversation">Start Conversation</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          {/* Render dynamic fields for the action type */}
                          {getActionFields(action.type || "message").fields.map((field) => (
                            <Input
                            key={field}
                            placeholder={field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            className="h-7 text-xs"
                            type={
                              ["amount", "fade_in", "stay", "fade_out", "duration", "amplifier", "volume", "pitch"].includes(field)
                              ? "number"
                              : "text"
                            }
                            value={action[field] ?? ""}
                            onChange={(e) => {
                              const actions = { ...localData.actions }
                              actions[key] = {
                              ...action,
                              [field]:
                                ["amount", "fade_in", "stay", "fade_out", "duration", "amplifier", "volume", "pitch"].includes(field)
                                ? Number(e.target.value)
                                : e.target.value,
                              }
                              updateField("actions", actions)
                            }}
                            />
                          ))}
                            {getActionFields(action.type || "message").fields.includes("location_type") && localData.actions[key].location_type==="custom" && (
                            <div className="grid grid-cols-3 gap-1">
                              <Input
                              placeholder="X"
                              className="h-7 text-xs"
                              type="number"
                              value={action.location?.x || ""}
                              onChange={(e) => {
                                const actions = { ...localData.actions }
                                actions[key] = {
                                ...action,
                                location: { ...action.location, x: Number(e.target.value) },
                                }
                                updateField("actions", actions)
                              }}
                              />
                              <Input
                              placeholder="Y"
                              className="h-7 text-xs"
                              type="number"
                              value={action.location?.y || ""}
                              onChange={(e) => {
                                const actions = { ...localData.actions }
                                actions[key] = {
                                ...action,
                                location: { ...action.location, y: Number(e.target.value) },
                                }
                                updateField("actions", actions)
                              }}
                              />
                              <Input
                              placeholder="Z"
                              className="h-7 text-xs"
                              type="number"
                              value={action.location?.z || ""}
                              onChange={(e) => {
                                const actions = { ...localData.actions }
                                actions[key] = {
                                ...action,
                                location: { ...action.location, z: Number(e.target.value) },
                                }
                                updateField("actions", actions)
                              }}
                              />
                              <Input
                              placeholder="World"
                              className="h-7 text-xs col-span-3"
                              value={action.location?.world || ""}
                              onChange={(e) => {
                                const actions = { ...localData.actions }
                                actions[key] = {
                                ...action,
                                location: { ...action.location, world: e.target.value },
                                }
                                updateField("actions", actions)
                              }}
                              />
                            </div>
                            )}
                          </div>
                        </div>
                        </Card>
                      ))}
                      {Object.keys(localData.actions || {}).length === 0 && (
                        <div className="text-xs text-amber-500 italic text-center py-2">
                        Sin acciones configuradas para este nodo
                        </div>
                      )}
                      </div>
                    </div>
                    </Card>
                  </TabsContent>
                  </div>
                </ScrollArea>
                </Tabs>
              </div>
              )
            }
