import { useMemo, useState } from 'react'
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type Node,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { FlowNode } from '@/components/FlowNode'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { TEMPLATES, TOOL_LIBRARY } from '@/data/templates'
import { generateLangGraphPython, generateLangGraphTS } from '@/lib/codegen'
import type { EdgeKind, FlowEdgeData, FlowNodeData, NodeRole } from '@/lib/types'

const nodeTypes = { flowNode: FlowNode }

const TOOLS_BY_CATEGORY = TOOL_LIBRARY.reduce<Record<string, typeof TOOL_LIBRARY>>(
  (acc, tool) => {
    acc[tool.category] = acc[tool.category] ?? []
    acc[tool.category].push(tool)
    return acc
  },
  {},
)

const ROLE_OPTIONS: { value: NodeRole; label: string; hint: string }[] = [
  {
    value: 'agent',
    label: 'Agent',
    hint: 'Reasoning step that decides what to do next.',
  },
  {
    value: 'tool',
    label: 'Tool',
    hint: 'Deterministic capability like search, email, or DB query.',
  },
  {
    value: 'router',
    label: 'Router',
    hint: 'Chooses the next node based on state or route key.',
  },
  {
    value: 'memory',
    label: 'Memory',
    hint: 'Reads or writes memory/context used by the flow.',
  },
]

const createNode = (role: NodeRole, index: number): Node<FlowNodeData> => ({
  id: crypto.randomUUID(),
  type: 'flowNode',
  position: { x: 140 + index * 30, y: 120 + index * 40 },
  data: {
    roles: [role],
    label: `${role[0].toUpperCase()}${role.slice(1)} node`,
    description: 'Describe what this node should do.',
    tools: [],
  },
})

const toRouteKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const applyEdgePresentation = (edge: Edge<FlowEdgeData>): Edge<FlowEdgeData> => {
  if (edge.data?.kind === 'conditional') {
    return {
      ...edge,
      label: edge.data.routeKey || 'route',
      style: { strokeDasharray: '6 4' },
      animated: true,
    }
  }
  return {
    ...edge,
    label: undefined,
    style: undefined,
    animated: false,
  }
}

const normalizeConditionalEdges = (
  edges: Edge<FlowEdgeData>[],
  nodes: Node<FlowNodeData>[],
) => {
  const outCounts = edges.reduce<Record<string, number>>((acc, edge) => {
    acc[edge.source] = (acc[edge.source] ?? 0) + 1
    return acc
  }, {})

  return edges.map((edge, index) => {
    const shouldBeConditional = (outCounts[edge.source] ?? 0) > 1
    const targetNode = nodes.find((node) => node.id === edge.target)
    const defaultKey =
      toRouteKey(targetNode?.data.label ?? '') || `route_${index + 1}`
    const nextData: FlowEdgeData = shouldBeConditional
      ? {
          kind: 'conditional',
          routeKey: edge.data?.routeKey || defaultKey,
        }
      : {
          kind: 'normal',
          routeKey: undefined,
        }
    return applyEdgePresentation({ ...edge, data: nextData })
  })
}

function App() {
  const [projectName, setProjectName] = useState('Agent Flow')
  const [nodes, setNodes] = useNodesState<FlowNodeData>([
    {
      id: 'seed',
      type: 'flowNode',
      position: { x: 120, y: 140 },
      data: {
        roles: ['agent'],
        label: 'Coordinator',
        description: 'Owns the workflow and delegates to tools or agents.',
        tools: [],
      },
    },
  ])
  const [edges, setEdges] = useEdgesState<Edge<FlowEdgeData>>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null

  const onConnect = (connection: Connection) => {
    setEdges((eds) => {
      const next = addEdge(
        {
          ...connection,
          id: crypto.randomUUID(),
          type: 'smoothstep',
          data: { kind: 'normal' },
        },
        eds,
      )
      return normalizeConditionalEdges(next, nodes)
    })
  }

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds))
  }

  const onEdgesChange = (changes: EdgeChange[]) => {
    setEdges((eds) => normalizeConditionalEdges(applyEdgeChanges(changes, eds), nodes))
  }

  const addNode = (role: NodeRole) => {
    setNodes((nds) => [...nds, createNode(role, nds.length)])
  }

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find((item) => item.id === templateId)
    if (!template) return

    const nextNodes = template.nodes.map((node, index) => ({
      id: crypto.randomUUID(),
      type: 'flowNode',
      position: { x: 140 + index * 240, y: 140 + (index % 2) * 120 },
      data: {
        roles: node.roles,
        label: node.label,
        description: node.description,
        tools: node.tools ?? [],
      },
    }))

    const nextEdges = template.edges.map((edge) => ({
      id: crypto.randomUUID(),
      source: nextNodes[edge.source].id,
      target: nextNodes[edge.target].id,
      type: 'smoothstep',
      animated: true,
      data: edge.routeKey
        ? {
            kind: 'conditional',
            routeKey: edge.routeKey,
          }
        : {
            kind: 'normal',
          },
    }))

    setNodes(nextNodes)
    setEdges(normalizeConditionalEdges(nextEdges, nextNodes))
    setSelectedNodeId(nextNodes[0]?.id ?? null)
    setSelectedEdgeId(null)
  }

  const updateSelectedNode = (patch: Partial<FlowNodeData>) => {
    if (!selectedNode) return
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== selectedNode.id) return node
        return { ...node, data: { ...node.data, ...patch } }
      }),
    )
  }

  const toggleTool = (toolId: string) => {
    if (!selectedNode) return
    const exists = selectedNode.data.tools.includes(toolId)
    updateSelectedNode({
      tools: exists
        ? selectedNode.data.tools.filter((id) => id !== toolId)
        : [...selectedNode.data.tools, toolId],
    })
  }

  const toggleRole = (role: NodeRole) => {
    if (!selectedNode) return
    const exists = selectedNode.data.roles.includes(role)
    const nextRoles = exists
      ? selectedNode.data.roles.filter((item) => item !== role)
      : [...selectedNode.data.roles, role]
    updateSelectedNode({ roles: nextRoles })
  }

  const pythonCode = useMemo(
    () => generateLangGraphPython({ nodes, edges }),
    [nodes, edges],
  )
  const tsCode = useMemo(() => generateLangGraphTS({ nodes, edges }), [nodes, edges])

  const updateSelectedEdge = (patch: Partial<FlowEdgeData>) => {
    if (!selectedEdge) return
    setEdges((eds) =>
      normalizeConditionalEdges(
        eds.map((edge) => {
        if (edge.id !== selectedEdge.id) return edge
        const data = { ...edge.data, ...patch } as FlowEdgeData
        return applyEdgePresentation({ ...edge, data })
      }),
      nodes,
    ),
    )
  }

  const toggleEdgeKind = (kind: EdgeKind) => {
    if (!selectedEdge) return
    const outgoingCount = edges.filter((edge) => edge.source === selectedEdge.source).length
    if (outgoingCount > 1) {
      updateSelectedEdge({ kind: 'conditional' })
      return
    }
    if (kind === 'conditional') {
      const targetNode = nodes.find((node) => node.id === selectedEdge.target)
      const defaultKey =
        toRouteKey(targetNode?.data.label ?? '') || `route_${edges.indexOf(selectedEdge) + 1}`
      updateSelectedEdge({ kind, routeKey: selectedEdge.data?.routeKey || defaultKey })
    } else {
      updateSelectedEdge({ kind, routeKey: undefined })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-card/80 px-6 py-4 backdrop-blur">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            GraphBuilder
          </p>
          <Input
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            className="max-w-[260px] text-lg font-semibold"
          />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">LangGraph</Badge>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Generate</Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[92vw]">
              <DialogHeader>
                <DialogTitle>Skeleton Code</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="python" className="w-full">
                <TabsList>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="ts">JS / TS</TabsTrigger>
                </TabsList>
                <TabsContent value="python" className="min-w-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Generated for {projectName || 'your project'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(pythonCode)}
                    >
                      Copy
                    </Button>
                  </div>
                  <pre className="max-h-[420px] w-full max-w-full overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-muted/40 p-4 text-sm">
                    <code>{pythonCode}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="ts" className="min-w-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Generated for {projectName || 'your project'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(tsCode)}
                    >
                      Copy
                    </Button>
                  </div>
                  <pre className="max-h-[420px] w-full max-w-full overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-muted/40 p-4 text-sm">
                    <code>{tsCode}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_1fr_320px]">
        <aside className="order-2 flex flex-col gap-4 lg:order-1">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Add Node</h2>
              <Badge variant="secondary">Canvas</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  onClick={() => addNode(option.value)}
                  title={option.hint}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="flex flex-1 flex-col p-4">
            <h2 className="text-sm font-semibold">Templates</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Start with a proven flow, then customize it.
            </p>
            <ScrollArea className="mt-3 h-[260px] pr-2">
              <div className="space-y-3">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template.id)}
                    className="w-full rounded-lg border bg-background px-3 py-3 text-left transition hover:border-primary/60 hover:bg-muted/50"
                  >
                    <p className="text-sm font-semibold">{template.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </aside>

        <section className="order-1 min-h-[520px] rounded-xl border bg-card/70 lg:order-2 lg:h-[calc(100vh-180px)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id)
              setSelectedEdgeId(null)
            }}
            onEdgeClick={(_, edge) => {
              setSelectedEdgeId(edge.id)
              setSelectedNodeId(null)
            }}
            onPaneClick={() => {
              setSelectedNodeId(null)
              setSelectedEdgeId(null)
            }}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background gap={24} size={1} color="hsl(var(--border))" />
            <Controls position="bottom-right" />
          </ReactFlow>
        </section>

        <aside className="order-3 flex flex-col gap-4">
          <Card className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Inspector</h2>
              <Badge variant="secondary">
                {selectedNode ? selectedNode.data.roles.join(', ') || 'Role' : 'None'}
              </Badge>
            </div>
            <Separator className="my-3" />
            {!selectedNode && !selectedEdge ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Select a node to define its role, tools, and behavior.</p>
                <p>Use templates for a quick starting point.</p>
              </div>
            ) : selectedEdge ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Edge Type
                  </label>
                  <Select
                    value={selectedEdge.data?.kind ?? 'normal'}
                    onValueChange={(value) => toggleEdgeKind(value as EdgeKind)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="conditional">Conditional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedEdge.data?.kind === 'conditional' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Route Key
                    </label>
                    <Input
                      value={selectedEdge.data.routeKey ?? ''}
                      onChange={(event) =>
                        updateSelectedEdge({ routeKey: event.target.value })
                      }
                      placeholder="needs_review"
                    />
                    <p className="text-xs text-muted-foreground">
                      The node should return this route key to take this edge.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <ScrollArea className="h-[520px] pr-3">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Roles
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ROLE_OPTIONS.map((option) => {
                        const active = selectedNode.data.roles.includes(option.value)
                        return (
                          <Button
                            key={option.value}
                            type="button"
                            size="sm"
                            variant={active ? 'secondary' : 'outline'}
                            onClick={() => toggleRole(option.value)}
                            title={option.hint}
                          >
                            {option.label}
                          </Button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Roles are labels, not limitations. An agent can also act like a tool or router.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Name
                    </label>
                    <Input
                      value={selectedNode.data.label}
                      onChange={(event) => updateSelectedNode({ label: event.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      What does this node do?
                    </label>
                    <Textarea
                      value={selectedNode.data.description}
                      onChange={(event) =>
                        updateSelectedNode({ description: event.target.value })
                      }
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Tools
                    </label>
                    <div className="space-y-4">
                      {Object.entries(TOOLS_BY_CATEGORY).map(([category, tools]) => (
                        <div key={category} className="space-y-2">
                          <p className="text-xs font-semibold capitalize text-muted-foreground">
                            {category}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tools.map((tool) => {
                              const selected = selectedNode.data.tools.includes(tool.id)
                              return (
                                <Button
                                  key={tool.id}
                                  type="button"
                                  size="sm"
                                  variant={selected ? 'secondary' : 'outline'}
                                  onClick={() => toggleTool(tool.id)}
                                >
                                  {tool.name}
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Attach tools a node can call during execution.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            )}
          </Card>
        </aside>
      </main>
    </div>
  )
}

export default App
