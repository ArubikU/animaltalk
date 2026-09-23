export type NodeType = "message" | "question" | "action" | "condition"

export interface ConversationNode {
  id: string
  type: NodeType
  label: string
  npcId?: string
  messages?: Record<string, string>
  choices?: Record<string, Choice>
  actions?: Record<string, Action>
  conditions?: Record<string, Condition>
  autoNext?: string
  autoNextDelay?: number
  pitch?: number
  endNode?: boolean
  trueNode?: string
  falseNode?: string
  conversation_keys?: string[]
}

export interface Choice {
  texts: Record<string, string>
  trigger: string
  nextNode: string
  actions?: Record<string, Action>
  conditions?: Record<string, Condition>
}

export interface Action {
  type: string
  script?: string
  variable?: string
  operation?: string
  value?: any
  scope?: string
  [key: string]: any
}

export interface Condition {
  type: string
  value?: any
  expected?: any
  operator?: string
  scope?: string
  [key: string]: any
}

export interface ConversationTree {
  id: string
  displayName: string
  description: string
  rootNodeId: string
  repeatable: boolean
  responseTimeout: number
  assignedNpc: string
  conditions: Record<string, Condition>
  globalVariables: Record<string, any>
  soundConfig: SoundConfig
}

export interface SoundConfig {
  defaultPitch: number
  defaultVolume: number
  defaultSoundSet: string
}
