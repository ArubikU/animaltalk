"use client"
import type { Node, Edge } from "reactflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Copy, Download, Code } from "lucide-react"
import type { ConversationTree } from "@/types/conversation-tree"
import yaml from "js-yaml"

interface YamlPreviewProps {
  nodes: Node[]
  edges: Edge[]
  tree: ConversationTree
}

export function YamlPreview({ nodes, edges, tree }: YamlPreviewProps) {
  const generateYaml = () => {
    const yamlNodes: any = {}

    nodes.forEach((node) => {
      const nodeData: any = {
        type: node.type,
        ...node.data,
      }
      console.log(nodeData)
      const tempt = nodeData.label +""
      delete nodeData.label
      yamlNodes[tempt] = nodeData
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
        .replace(/"/g, "")
        .replace(/,/g, "")
        .replace(/{/g, "")
        .replace(/}/g, "")
        .replace(/\[/g, "")
        .replace(/\]/g, "")
    }
  }

  const yamlContent = generateYaml()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(yamlContent)
  }

  const downloadYaml = () => {
    const blob = new Blob([yamlContent], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${tree.id}.yml`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-full flex flex-col border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Code className="w-4 h-4 text-slate-600" />
            Vista Previa YAML
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="h-8 border-slate-200 hover:bg-slate-100"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadYaml}
              className="h-8 border-slate-200 hover:bg-slate-100"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <pre className="text-xs font-mono p-4 whitespace-pre-wrap bg-slate-50 rounded-md">{yamlContent}</pre>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
