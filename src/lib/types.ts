export type NodeRole = 'agent' | 'tool' | 'router' | 'memory'

export type ToolDefinition = {
  id: string
  name: string
  description: string
  category: 'research' | 'automation' | 'collaboration' | 'data' | 'ops'
}

export type FlowNodeData = {
  roles: NodeRole[]
  label: string
  description: string
  tools: string[]
}

export type EdgeKind = 'normal' | 'conditional'

export type FlowEdgeData = {
  kind: EdgeKind
  routeKey?: string
}

export type TemplateNode = {
  roles: NodeRole[]
  label: string
  description: string
  tools?: string[]
}

export type TemplateEdge = {
  source: number
  target: number
  routeKey?: string
}

export type GraphTemplate = {
  id: string
  name: string
  description: string
  nodes: TemplateNode[]
  edges: TemplateEdge[]
}
