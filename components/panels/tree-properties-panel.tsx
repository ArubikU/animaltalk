"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ConversationTree } from "@/types/conversation-tree"

interface TreePropertiesPanelProps {
  tree: ConversationTree
  onUpdate: (tree: ConversationTree) => void
}

export function TreePropertiesPanel({ tree, onUpdate }: TreePropertiesPanelProps) {
  const updateField = (field: keyof ConversationTree, value: any) => {
    onUpdate({ ...tree, [field]: value })
  }

  const updateSoundConfig = (field: string, value: any) => {
    onUpdate({
      ...tree,
      soundConfig: {
        ...tree.soundConfig,
        [field]: value,
      },
    })
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tree-id" className="text-sm font-medium text-slate-700">
                ID del Árbol
              </Label>
              <Input
                id="tree-id"
                value={tree.id}
                onChange={(e) => updateField("id", e.target.value)}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-sm font-medium text-slate-700">
                Nombre para Mostrar
              </Label>
              <Input
                id="display-name"
                value={tree.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={tree.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="root-node" className="text-sm font-medium text-slate-700">
                Nodo Raíz
              </Label>
              <Input
                id="root-node"
                value={tree.rootNodeId}
                onChange={(e) => updateField("rootNodeId", e.target.value)}
                placeholder="ID del nodo inicial"
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned-npc" className="text-sm font-medium text-slate-700">
                NPC Asignado
              </Label>
              <Input
                id="assigned-npc"
                value={tree.assignedNpc}
                onChange={(e) => updateField("assignedNpc", e.target.value)}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="repeatable"
                checked={tree.repeatable}
                onCheckedChange={(checked) => updateField("repeatable", checked)}
              />
              <Label htmlFor="repeatable" className="text-sm font-medium text-slate-700">
                Repetible
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout" className="text-sm font-medium text-slate-700">
                Tiempo de Respuesta (segundos)
              </Label>
              <Input
                id="timeout"
                type="number"
                value={tree.responseTimeout}
                onChange={(e) => updateField("responseTimeout", Number.parseInt(e.target.value))}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Configuración de Sonido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-pitch" className="text-sm font-medium text-slate-700">
                Tono por Defecto
              </Label>
              <Input
                id="default-pitch"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={tree.soundConfig.defaultPitch}
                onChange={(e) => updateSoundConfig("defaultPitch", Number.parseFloat(e.target.value))}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-volume" className="text-sm font-medium text-slate-700">
                Volumen por Defecto
              </Label>
              <Input
                id="default-volume"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={tree.soundConfig.defaultVolume}
                onChange={(e) => updateSoundConfig("defaultVolume", Number.parseFloat(e.target.value))}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sound-set" className="text-sm font-medium text-slate-700">
                Set de Sonidos
              </Label>
              <Input
                id="sound-set"
                value={tree.soundConfig.defaultSoundSet}
                onChange={(e) => updateSoundConfig("defaultSoundSet", e.target.value)}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              Variables Globales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Variables en formato YAML..."
              value={JSON.stringify(tree.globalVariables, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  updateField("globalVariables", parsed)
                } catch (error) {
                  // Ignorar errores de parsing mientras se escribe
                }
              }}
              rows={6}
              className="font-mono text-xs border-slate-200 focus:border-blue-500"
            />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
