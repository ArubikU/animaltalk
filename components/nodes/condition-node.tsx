"use client"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, CheckCircle, XCircle } from "lucide-react"

export function ConditionNodeComponent({ data, selected }: NodeProps) {
  const conditionCount = Object.keys(data.conditions || {}).length

  return (
    <Card className={`w-64 ${selected ? "ring-2 ring-purple-500 shadow-lg" : ""} bg-white/90 backdrop-blur-sm`}>
      <Handle type="target" position={Position.Top} />

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded-md">
            <Settings className="w-4 h-4 text-purple-600" />
          </div>
          <span className="font-medium text-sm">{data.label}</span>
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
            Condición
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">{conditionCount} condiciones</div>

          {conditionCount > 0 && (
            <div className="space-y-1">
              {Object.entries(data.conditions || {})
                .slice(0, 2)
                .map(([key, condition]: [string, any]) => (
                  <div key={key} className="text-xs bg-purple-50 p-1.5 rounded border border-purple-100">
                    <span className="font-medium">{condition.type}</span>: {key}
                  </div>
                ))}
              {conditionCount > 2 && <div className="text-xs text-muted-foreground">+{conditionCount - 2} más...</div>}
            </div>
          )}

          <div className="flex gap-2">
            {data.trueNode && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verdadero: {data.trueNode}
              </Badge>
            )}
            {data.falseNode && (
              <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                <XCircle className="w-3 h-3 mr-1" />
                Falso: {data.falseNode}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      {/* Handles para verdadero y falso */}
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: "25%" }} className="bg-green-500" />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: "75%" }} className="bg-red-500" />
    </Card>
  )
}
