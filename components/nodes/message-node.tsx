"use client"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Volume2 } from "lucide-react"

export function MessageNodeComponent({ data, selected }: NodeProps) {
  return (
    <Card className={`w-64 ${selected ? "ring-2 ring-green-500 shadow-lg" : ""} bg-white/90 backdrop-blur-sm`}>
      <Handle type="target" position={Position.Top} />

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-100 rounded-md">
            <MessageSquare className="w-4 h-4 text-green-600" />
          </div>
          <span className="font-medium text-sm">{data.label}</span>
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
            Mensaje
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            NPC: <span className="font-medium">{data.npcId}</span>
          </div>

          <div className="text-sm bg-green-50 p-2 rounded text-wrap border border-green-100">
            {data.messages?.default || data.messages?.es || "Sin mensaje"}
          </div>

          {data.pitch && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Volume2 className="w-3 h-3" />
              Tono: {data.pitch}
            </div>
          )}

          {data.autoNext && (
            <Badge variant="outline" className="text-xs">
              Auto → {data.autoNext}
            </Badge>
          )}
        </div>
      </CardContent>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  )
}
