import type { Edge, Node } from 'reactflow'
import type { FlowEdgeData, FlowNodeData, NodeRole } from './types'

const ROLE_ORDER: NodeRole[] = ['agent', 'tool', 'router', 'memory']
const MEMORY_ROLE_PATTERN =
  /\b(memory|context|history|store|persist|recall|retrieve|knowledge|cache)\b/i
const MEMORY_TOOL_IDS = new Set(['db-query', 'notion'])

export const applyFunctionalRoles = (
  nodes: Node<FlowNodeData>[],
  edges: Edge<FlowEdgeData>[],
) => {
  const outCounts = edges.reduce<Record<string, number>>((acc, edge) => {
    acc[edge.source] = (acc[edge.source] ?? 0) + 1
    return acc
  }, {})

  return nodes.map((node) => {
    const inferred = new Set<NodeRole>(['agent'])
    if (node.data.tools.length > 0) inferred.add('tool')
    if ((outCounts[node.id] ?? 0) > 1) inferred.add('router')

    const hasMemoryText = MEMORY_ROLE_PATTERN.test(`${node.data.label} ${node.data.description}`)
    const hasMemoryTool = node.data.tools.some((toolId) => MEMORY_TOOL_IDS.has(toolId))
    if (hasMemoryText || hasMemoryTool) inferred.add('memory')

    const nextRoles = ROLE_ORDER.filter(
      (role) => node.data.roles.includes(role) || inferred.has(role),
    )
    const unchanged =
      nextRoles.length === node.data.roles.length &&
      nextRoles.every((role, index) => role === node.data.roles[index])
    if (unchanged) return node

    return {
      ...node,
      data: {
        ...node.data,
        roles: nextRoles,
      },
    }
  })
}
