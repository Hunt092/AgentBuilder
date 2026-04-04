import type { Edge, Node } from 'reactflow'
import type { FlowEdgeData, FlowNodeData, NodeRole } from './types'

const BASE_X = 140
const BASE_Y = 110
const X_GAP = 300
const Y_GAP = 150

const ROLE_ROW: Record<NodeRole, number> = {
  router: 0,
  agent: 1,
  tool: 2,
  memory: 3,
}

export const getPrimaryRole = (roles: NodeRole[]): NodeRole => {
  if (roles.includes('router')) return 'router'
  if (roles.includes('memory')) return 'memory'
  if (roles.includes('tool')) return 'tool'
  return 'agent'
}

export const getMiniMapNodeColor = (roles: NodeRole[]) => {
  const role = getPrimaryRole(roles)
  if (role === 'router') return '#f97316'
  if (role === 'tool') return '#10b981'
  if (role === 'memory') return '#0ea5e9'
  return '#3b82f6'
}

export const autoArrangeNodes = (
  nodes: Node<FlowNodeData>[],
  edges: Edge<FlowEdgeData>[],
) => {
  if (nodes.length === 0) return nodes

  const nodeIds = new Set(nodes.map((node) => node.id))
  const edgesInGraph = edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))

  const adjacency = new Map<string, string[]>()
  const indegree = new Map<string, number>()
  const level = new Map<string, number>()

  nodes.forEach((node) => {
    adjacency.set(node.id, [])
    indegree.set(node.id, 0)
  })

  edgesInGraph.forEach((edge) => {
    adjacency.get(edge.source)?.push(edge.target)
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
  })

  const queue = nodes
    .filter((node) => (indegree.get(node.id) ?? 0) === 0)
    .sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y)
    .map((node) => node.id)

  queue.forEach((id) => level.set(id, 0))

  const visited = new Set<string>()

  while (queue.length > 0) {
    const sourceId = queue.shift()
    if (!sourceId) continue
    visited.add(sourceId)
    const sourceLevel = level.get(sourceId) ?? 0

    ;(adjacency.get(sourceId) ?? []).forEach((targetId) => {
      level.set(targetId, Math.max(level.get(targetId) ?? 0, sourceLevel + 1))
      indegree.set(targetId, (indegree.get(targetId) ?? 1) - 1)
      if ((indegree.get(targetId) ?? 0) === 0) {
        queue.push(targetId)
      }
    })
  }

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      level.set(node.id, Math.max(0, Math.round((node.position.x - BASE_X) / X_GAP)))
    }
  })

  const maxLevel = Math.max(...nodes.map((node) => level.get(node.id) ?? 0))
  const byLevel = Array.from({ length: maxLevel + 1 }, () => [] as Node<FlowNodeData>[])

  nodes.forEach((node) => {
    byLevel[level.get(node.id) ?? 0].push(node)
  })

  const positioned = new Map<string, { x: number; y: number }>()

  byLevel.forEach((levelNodes, levelIndex) => {
    levelNodes.sort((a, b) => {
      const roleDiff =
        ROLE_ROW[getPrimaryRole(a.data.roles)] - ROLE_ROW[getPrimaryRole(b.data.roles)]
      if (roleDiff !== 0) return roleDiff
      return a.data.label.localeCompare(b.data.label)
    })

    levelNodes.forEach((node, rowIndex) => {
      positioned.set(node.id, {
        x: BASE_X + levelIndex * X_GAP,
        y: BASE_Y + rowIndex * Y_GAP,
      })
    })
  })

  return nodes.map((node) => {
    const position = positioned.get(node.id)
    if (!position) return node
    return { ...node, position }
  })
}
