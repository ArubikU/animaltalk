"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, HelpCircle, Zap, Settings, Plus } from "lucide-react"
import type { NodeType } from "@/types/conversation-tree"

interface NodeToolbarProps {
  onAddNode: (type: NodeType) => void
}

export function NodeToolbar({ onAddNode }: NodeToolbarProps) {
  const nodeTypes = [
    {
      type: "message" as NodeType,
      label: "Mensaje",
      description: "Muestra un mensaje del NPC",
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
      borderColor: "border-green-200",
    },
    {
      type: "question" as NodeType,
      label: "Pregunta",
      description: "Presenta opciones al jugador",
      icon: HelpCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      borderColor: "border-blue-200",
    },
    {
      type: "action" as NodeType,
      label: "Acción",
      description: "Ejecuta comandos o acciones",
      icon: Zap,
      color: "text-amber-600",
      bgColor: "bg-amber-50 hover:bg-amber-100",
      borderColor: "border-amber-200",
    },
    {
      type: "condition" as NodeType,
      label: "Condición",
      description: "Evalúa condiciones lógicas",
      icon: Settings,
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      borderColor: "border-purple-200",
    },
  ]

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tipos de Nodos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon
          return (
            <Button
              key={nodeType.type}
              variant="outline"
              className={`w-full justify-start h-auto p-4 transition-all duration-200 ${nodeType.bgColor} ${nodeType.borderColor} border-2 hover:shadow-md hover:scale-105`}
              onClick={() => onAddNode(nodeType.type)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`p-2 rounded-lg bg-white shadow-sm ${nodeType.borderColor} border`}>
                  <Icon className={`w-4 h-4 ${nodeType.color}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm text-slate-700">{nodeType.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{nodeType.description}</div>
                </div>
              </div>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
