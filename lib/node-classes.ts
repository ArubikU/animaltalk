// Base Node Class
export abstract class ConversationNode {
  id: string
  type: string
  label: string
  position: { x: number; y: number }

  constructor(id: string, type: string, label: string, position: { x: number; y: number }) {
    this.id = id
    this.type = type
    this.label = label
    this.position = position
  }

  abstract toReactFlowNode(): any
  abstract toYAML(): any
  abstract getDefaultData(): any
  abstract updateData(data: any): void  
}

// Message Node Class
export class MessageNode extends ConversationNode {
  npcId: string
  messages: Record<string, string>
  pitch: number
  actions: Record<string, Action>
  autoNext?: string
  autoNextDelay?: number

  constructor(id: string, position: { x: number; y: number }) {
    super(id, "message", "Nuevo Mensaje", position)
    this.npcId = "guide"
    this.messages = { default: "Mensaje por defecto" }
    this.pitch = 0.4
    this.actions = {}
    this.autoNext = ""
    this.autoNextDelay = 0
  }

  toReactFlowNode() {
    return {
      id: this.id,
      type: "message",
      position: this.position,
      data: {
        label: this.label,
        npcId: this.npcId,
        messages: this.messages,
        pitch: this.pitch,
        actions: this.actions,
        autoNext: this.autoNext,
        autoNextDelay: this.autoNextDelay,
      },
    }
  }

  toYAML() {
    return {
      npc_id: this.npcId,
      messages: this.messages,
      pitch: this.pitch,
      type: "message",
      actions: this.actions,
      auto_next: this.autoNext,
      auto_next_delay: this.autoNextDelay,
    }
  }

  getDefaultData() {
    return {
      label: this.label,
      npcId: this.npcId,
      messages: this.messages,
      pitch: this.pitch,
      actions: this.actions,
      autoNext: this.autoNext,
      autoNextDelay: this.autoNextDelay,
    }
  }

  updateData(data: any) {
    Object.assign(this, data)
  }
}

// Question Node Class
export class QuestionNode extends ConversationNode {
  npcId: string
  messages: Record<string, string>
  pitch: number
  choices: Record<string, Choice>
  actions: Record<string, Action>

  constructor(id: string, position: { x: number; y: number }) {
    super(id, "question", "Nueva Pregunta", position)
    this.npcId = "guide"
    this.messages = { default: "¿Qué eliges?" }
    this.pitch = 0.4
    this.choices = {}
    this.actions = {}
  }

  addChoice(key: string, choice: Choice) {
    this.choices[key] = choice
  }

  removeChoice(key: string) {
    delete this.choices[key]
  }

  toReactFlowNode() {
    return {
      id: this.id,
      type: "question",
      position: this.position,
      data: {
        label: this.label,
        npcId: this.npcId,
        messages: this.messages,
        pitch: this.pitch,
        choices: this.choices,
        actions: this.actions,
      },
    }
  }

  toYAML() {
    return {
      npc_id: this.npcId,
      messages: this.messages,
      pitch: this.pitch,
      type: "question",
      choices: this.choices,
      actions: this.actions,
    }
  }

  getDefaultData() {
    return {
      label: this.label,
      npcId: this.npcId,
      messages: this.messages,
      pitch: this.pitch,
      choices: this.choices,
      actions: this.actions,
    }
  }

  updateData(data: any) {
    Object.assign(this, data)
  }
}

// Action Node Class
export class ActionNode extends ConversationNode {
  actions: Record<string, Action>
  endNode: boolean

  constructor(id: string, position: { x: number; y: number }) {
    super(id, "action", "Nueva Acción", position)
    this.actions = {}
    this.endNode = false
  }

  toReactFlowNode() {
    return {
      id: this.id,
      type: "action",
      position: this.position,
      data: {
        label: this.label,
        actions: this.actions,
        endNode: this.endNode,
      },
    }
  }

  toYAML() {
    return {
      type: "action",
      actions: this.actions,
      end_node: this.endNode,
    }
  }

  getDefaultData() {
    return {
      label: this.label,
      actions: this.actions,
      endNode: this.endNode,
    }
  }

  updateData(data: any) {
    Object.assign(this, data)
  }
}

// Condition Node Class
export class ConditionNode extends ConversationNode {
  conditions: Record<string, Condition>
  trueNode: string
  falseNode: string

  constructor(id: string, position: { x: number; y: number }) {
    super(id, "condition", "Nueva Condición", position)
    this.conditions = {}
    this.trueNode = ""
    this.falseNode = ""
  }

  toReactFlowNode() {
    return {
      id: this.id,
      type: "condition",
      position: this.position,
      data: {
        label: this.label,
        conditions: this.conditions,
        trueNode: this.trueNode,
        falseNode: this.falseNode,
      },
    }
  }

  toYAML() {
    return {
      type: "condition",
      conditions: this.conditions,
      true_node: this.trueNode,
      false_node: this.falseNode,
    }
  }

  getDefaultData() {
    return {
      label: this.label,
      conditions: this.conditions,
      trueNode: this.trueNode,
      falseNode: this.falseNode,
    }
  }

  updateData(data: any) {
    Object.assign(this, data)
  }
}

// Supporting Classes
export class Choice {
  texts: Record<string, string>
  trigger: string
  nextNode: string
  conditions?: Record<string, Condition>
  actions?: Record<string, Action>

  constructor(texts: Record<string, string>, trigger: string, nextNode: string) {
    this.texts = texts
    this.trigger = trigger
    this.nextNode = nextNode
    this.conditions = {}
    this.actions = {}
  }

  addCondition(key: string, condition: Condition) {
    if (!this.conditions) this.conditions = {}
    this.conditions[key] = condition
  }

  addAction(key: string, action: Action) {
    if (!this.actions) this.actions = {}
    this.actions[key] = action
  }
}

export class Action {
  type: string
  value?: any;
  [key: string]: any

  constructor(type: string, value?: any) {
    this.type = type
    this.value = value
  }
}

export class Condition {
  type: string
  value?: any
  expected?: any
  operator?: string
  scope?: string;
  [key: string]: any

  constructor(type: string, value?: any, expected?: any, operator?: string) {
    this.type = type
    this.value = value
    this.expected = expected
    this.operator = operator || ">="
  }
}

// Node Factory
export class NodeFactory {
  static createNode(type: string, id: string, position: { x: number; y: number }): ConversationNode {
    switch (type) {
      case "message":
        return new MessageNode(id, position)
      case "question":
        return new QuestionNode(id, position)
      case "action":
        return new ActionNode(id, position)
      case "condition":
        return new ConditionNode(id, position)
      default:
        throw new Error(`Unknown node type: ${type}`)
    }
  }
}
