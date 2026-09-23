"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowRight, HelpCircle } from "lucide-react"
import { Handle, Position, type NodeProps } from "reactflow"

export function QuestionNodeComponent({ data, selected }: NodeProps) {
  const choiceCount = Object.keys(data.choices || {}).length

  return (
    <Card className={`w-64 ${selected ? "ring-2 ring-blue-500 shadow-lg" : ""} bg-white/90 backdrop-blur-sm`}>
      <Handle type="target" position={Position.Top} />

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <HelpCircle className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium text-sm">{data.label}</span>
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
            Pregunta
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            NPC: <span className="font-medium">{data.npcId}</span>
          </div>

          <div className="text-sm bg-blue-50 p-2 rounded border border-blue-100">
            {data.messages?.default || data.messages?.es || "Sin pregunta"}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowRight className="w-3 h-3" />
            {choiceCount} opciones
          </div>

          {choiceCount > 0 && (
            <div className="space-y-1">
              {Object.entries(data.choices || {})
                .slice(0, 2)
                .map(([key, choice]: [string, any]) => (
                  <div key={key} className="text-xs bg-blue-50 p-1.5 rounded border border-blue-100">
                        {choice.texts?.default || choice.texts?.es || key}
                  </div>
                ))}
              {choiceCount > 2 && <div className="text-xs text-muted-foreground">+{choiceCount - 2} más...</div>}
            </div>
          )}
        </div>
      </CardContent>

      {/* Múltiples handles de salida para las opciones */}
      {Array.from({ length: Math.min(choiceCount, 4) }, (_, i) => (
        <Handle
          key={i}
          type="source"
          position={Position.Bottom}
          id={`choice-${i}`}
          style={{ left: `${20 + (i * 60) / Math.min(choiceCount, 4)}%` }}
        />
      ))}
    </Card>
  )
}
