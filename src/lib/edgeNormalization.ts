import type { Edge, Node } from 'reactflow'
import type { FlowEdgeData, FlowNodeData } from './types'

export const toRouteKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

export const buildDefaultRouteKey = (
  targetLabel: string | undefined,
  edgeId: string | undefined,
  fallbackIndex: number,
) =>
  toRouteKey(targetLabel ?? '') || `route_${edgeId ? edgeId.slice(0, 6) : fallbackIndex}`

export const applyEdgePresentation = (edge: Edge<FlowEdgeData>): Edge<FlowEdgeData> => {
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

export const normalizeConditionalEdges = (
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
    const nextData: FlowEdgeData = shouldBeConditional
      ? {
          kind: 'conditional',
          routeKey: edge.data?.routeKey || buildDefaultRouteKey(targetNode?.data.label, edge.id, index + 1),
        }
      : {
          kind: 'normal',
          routeKey: undefined,
        }
    return applyEdgePresentation({ ...edge, data: nextData })
  })
}
