import { useMemo, useState } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  type Connection,
  type Edge,
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
import type { FlowNodeData, NodeKind } from '@/lib/types'

const nodeTypes = { flowNode: FlowNode }

const TOOLS_BY_CATEGORY = TOOL_LIBRARY.reduce<Record<string, typeof TOOL_LIBRARY>>(
  (acc, tool) => {
    acc[tool.category] = acc[tool.category] ?? []
    acc[tool.category].push(tool)
    return acc
  },
  {},
)

const KIND_OPTIONS: { value: NodeKind; label: string }[] = [
  { value: 'agent', label: 'Agent' },
  { value: 'tool', label: 'Tool' },
  { value: 'router', label: 'Router' },
  { value: 'memory', label: 'Memory' },
]

const createNode = (kind: NodeKind, index: number): Node<FlowNodeData> => ({
  id: crypto.randomUUID(),
  type: 'flowNode',
  position: { x: 140 + index * 30, y: 120 + index * 40 },
  data: {
    kind,
    label: `${kind[0].toUpperCase()}${kind.slice(1)} node`,
    description: 'Describe what this node should do.',
    tools: [],
  },
})

function App() {
  const [projectName, setProjectName] = useState('Agent Flow')
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeData>([
    {
      id: 'seed',
      type: 'flowNode',
      position: { x: 120, y: 140 },
      data: {
        kind: 'agent',
        label: 'Coordinator',
        description: 'Owns the workflow and delegates to tools or agents.',
        tools: [],
      },
    },
  ])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null

  const onConnect = (connection: Connection) => {
    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: true,
        },
        eds,
      ),
    )
  }

  const addNode = (kind: NodeKind) => {
    setNodes((nds) => [...nds, createNode(kind, nds.length)])
  }

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find((item) => item.id === templateId)
    if (!template) return

    const nextNodes = template.nodes.map((node, index) => ({
      id: crypto.randomUUID(),
      type: 'flowNode',
      position: { x: 140 + index * 240, y: 140 + (index % 2) * 120 },
      data: {
        kind: node.kind,
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
    }))

    setNodes(nextNodes)
    setEdges(nextEdges)
    setSelectedNodeId(nextNodes[0]?.id ?? null)
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

  const pythonCode = useMemo(
    () => generateLangGraphPython({ nodes, edges }),
    [nodes, edges],
  )
  const tsCode = useMemo(() => generateLangGraphTS({ nodes, edges }), [nodes, edges])

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
              {KIND_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  onClick={() => addNode(option.value)}
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
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
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
                {selectedNode ? selectedNode.data.kind : 'None'}
              </Badge>
            </div>
            <Separator className="my-3" />
            {!selectedNode ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Select a node to define its role, tools, and behavior.</p>
                <p>Use templates for a quick starting point.</p>
              </div>
            ) : (
              <ScrollArea className="h-[520px] pr-3">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Node Type
                    </label>
                    <Select
                      value={selectedNode.data.kind}
                      onValueChange={(value) => updateSelectedNode({ kind: value as NodeKind })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KIND_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
