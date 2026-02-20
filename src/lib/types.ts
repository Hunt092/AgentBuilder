export type NodeKind = 'agent' | 'tool' | 'router' | 'memory'

export type ToolDefinition = {
  id: string
  name: string
  description: string
  category: 'research' | 'automation' | 'collaboration' | 'data' | 'ops'
}

export type FlowNodeData = {
  kind: NodeKind
  label: string
  description: string
  tools: string[]
}

export type TemplateNode = {
  kind: NodeKind
  label: string
  description: string
  tools?: string[]
}

export type TemplateEdge = {
  source: number
  target: number
}

export type GraphTemplate = {
  id: string
  name: string
  description: string
  nodes: TemplateNode[]
  edges: TemplateEdge[]
}
