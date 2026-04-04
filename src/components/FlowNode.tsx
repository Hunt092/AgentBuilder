import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { TOOL_LIBRARY } from '@/data/templates'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getPrimaryRole } from '@/lib/graphLayout'
import type { FlowNodeData, NodeRole } from '@/lib/types'

const ROLE_LABEL: Record<NodeRole, string> = {
  agent: 'Agent',
  tool: 'Tool',
  router: 'Router',
  memory: 'Memory',
}

const ROLE_SURFACE: Record<NodeRole, string> = {
  agent: 'border-blue-300/60 bg-blue-50/20 dark:border-blue-500/40 dark:bg-blue-950/10',
  tool: 'border-emerald-300/60 bg-emerald-50/20 dark:border-emerald-500/40 dark:bg-emerald-950/10',
  router: 'border-orange-300/60 bg-orange-50/20 dark:border-orange-500/40 dark:bg-orange-950/10',
  memory: 'border-cyan-300/60 bg-cyan-50/20 dark:border-cyan-500/40 dark:bg-cyan-950/10',
}

const ROLE_ACCENT: Record<NodeRole, string> = {
  agent: 'bg-blue-400/85 dark:bg-blue-400/75',
  tool: 'bg-emerald-400/85 dark:bg-emerald-400/75',
  router: 'bg-orange-400/85 dark:bg-orange-400/75',
  memory: 'bg-cyan-400/85 dark:bg-cyan-400/75',
}

export function FlowNode({ data, selected }: NodeProps<FlowNodeData>) {
  const toolNames = new Map(TOOL_LIBRARY.map((tool) => [tool.id, tool.name]))
  const primaryRole = getPrimaryRole(data.roles)
  const surfaceClass = ROLE_SURFACE[primaryRole]
  const accentClass = ROLE_ACCENT[primaryRole]

  return (
    <Card
      className={[
        'relative min-w-[190px] max-w-[240px] overflow-hidden border bg-card/95 px-3 py-2 shadow-sm',
        surfaceClass,
        selected ? 'ring-2 ring-ring' : 'ring-1 ring-transparent',
      ].join(' ')}
    >
      <div className={['absolute inset-x-0 top-0 h-1', accentClass].join(' ')} />
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
