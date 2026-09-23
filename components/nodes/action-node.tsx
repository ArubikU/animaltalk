"use client"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Gift, DollarSign, Command } from "lucide-react"

export function ActionNodeComponent({ data, selected }: NodeProps) {
  const actionCount = Object.keys(data.actions || {}).length
  const actionTypes = Object.values(data.actions || {}).map((action: any) => action.type)

  const getActionIcon = (type: string) => {
    switch (type) {
      case "give_item":
      case "give_custom_item":
        return <Gift className="w-3 h-3" />
      case "give_money":
        return <DollarSign className="w-3 h-3" />
      case "command":
      case "console_command":
        return <Command className="w-3 h-3" />
      default:
        return <Zap className="w-3 h-3" />
    }
  }

  return (
    <Card className={`w-64 ${selected ? "ring-2 ring-amber-500 shadow-lg" : ""} bg-white/90 backdrop-blur-sm`}>
      <Handle type="target" position={Position.Top} />

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 rounded-md">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <span className="font-medium text-sm">{data.label}</span>
          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
            Acción
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">{actionCount} acciones configuradas</div>

          {actionCount > 0 && (
            <div className="space-y-1">
              {Object.entries(data.actions || {})
                .slice(0, 3)
                .map(([key, action]: [string, any]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 text-xs bg-amber-50 p-1.5 rounded border border-amber-100"
                  >
                    {getActionIcon(action.type)}
                    <span className="font-medium">{action.type}</span>
                  </div>
                ))}
              {actionCount > 3 && <div className="text-xs text-muted-foreground">+{actionCount - 3} más...</div>}
            </div>
          )}

          {data.endNode && (
            <Badge variant="destructive" className="text-xs">
              Nodo final
            </Badge>
          )}
        </div>
      </CardContent>

      {!data.endNode && <Handle type="source" position={Position.Bottom} />}
    </Card>
  )
}
