import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { TOOL_LIBRARY } from '@/data/templates'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { FlowNodeData, NodeRole } from '@/lib/types'

const ROLE_LABEL: Record<NodeRole, string> = {
  agent: 'Agent',
  tool: 'Tool',
  router: 'Router',
  memory: 'Memory',
}

export function FlowNode({ data, selected }: NodeProps<FlowNodeData>) {
  const toolNames = new Map(TOOL_LIBRARY.map((tool) => [tool.id, tool.name]))
  return (
    <Card
      className={[
        'min-w-[190px] max-w-[240px] border bg-card/95 px-3 py-2 shadow-sm',
        selected ? 'ring-2 ring-ring' : 'ring-1 ring-transparent',
      ].join(' ')}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-2.5 w-2.5 border border-background bg-primary"
      />
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-tight">{data.label || 'Untitled node'}</p>
          <p className="text-xs text-muted-foreground">{data.description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {data.roles.length === 0 ? (
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              Role
            </Badge>
          ) : (
            data.roles.map((role) => (
              <Badge
                key={role}
                variant="secondary"
                className="text-[10px] uppercase tracking-wide"
              >
                {ROLE_LABEL[role]}
              </Badge>
            ))
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {data.tools.length === 0 ? (
          <span className="text-[11px] text-muted-foreground">No tools</span>
        ) : (
          data.tools.slice(0, 3).map((tool) => (
            <Badge key={tool} variant="outline" className="text-[10px]">
              {toolNames.get(tool) ?? tool}
            </Badge>
          ))
        )}
        {data.tools.length > 3 ? (
          <Badge variant="outline" className="text-[10px]">
            +{data.tools.length - 3}
          </Badge>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="h-2.5 w-2.5 border border-background bg-primary"
      />
    </Card>
  )
}
