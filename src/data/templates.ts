import type { GraphTemplate, ToolDefinition } from '@/lib/types'

export const TOOL_LIBRARY: ToolDefinition[] = [
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web and return relevant sources.',
    category: 'research',
  },
  {
    id: 'doc-summarizer',
    name: 'Doc Summarizer',
    description: 'Condense long content into key points.',
    category: 'research',
  },
  {
    id: 'db-query',
    name: 'DB Query',
    description: 'Run parameterized queries on a database.',
    category: 'data',
  },
  {
    id: 'crm-update',
    name: 'CRM Update',
    description: 'Create or update CRM records.',
    category: 'collaboration',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Schedule or move meetings.',
    category: 'collaboration',
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Draft and send customer-ready emails.',
    category: 'collaboration',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Write specs and notes to a workspace.',
    category: 'collaboration',
  },
  {
    id: 'ticketing',
    name: 'Ticketing',
    description: 'Create or update support tickets.',
    category: 'ops',
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Trigger external workflows over HTTP.',
    category: 'automation',
  },
]

export const TEMPLATES: GraphTemplate[] = [
  {
    id: 'research-sprint',
    name: 'Research Sprint',
    description: 'Research → gather sources → synthesize in one pass.',
    nodes: [
      {
        kind: 'agent',
        label: 'Lead Researcher',
        description: 'Define scope, questions, and guardrails.',
        tools: ['web-search'],
      },
      {
        kind: 'tool',
        label: 'Source Collector',
        description: 'Pull relevant sources and surface citations.',
        tools: ['web-search'],
      },
      {
        kind: 'agent',
        label: 'Synthesizer',
        description: 'Turn sources into a concise narrative.',
        tools: ['doc-summarizer'],
      },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
    ],
  },
  {
    id: 'support-copilot',
    name: 'Support Copilot',
    description: 'Triage → resolve → update CRM with follow-ups.',
    nodes: [
      {
        kind: 'agent',
        label: 'Triage Agent',
        description: 'Classify intent and extract key details.',
        tools: ['ticketing'],
      },
      {
        kind: 'agent',
        label: 'Resolution Agent',
        description: 'Draft reply and decide next steps.',
        tools: ['email'],
      },
      {
        kind: 'tool',
        label: 'CRM Sync',
        description: 'Update CRM with ticket status and notes.',
        tools: ['crm-update'],
      },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
    ],
  },
  {
    id: 'prd-builder',
    name: 'Product Requirements',
    description: 'Capture intent → draft PRD → share with team.',
    nodes: [
      {
        kind: 'agent',
        label: 'PM Copilot',
        description: 'Clarify goals, constraints, and success metrics.',
        tools: ['calendar'],
      },
      {
        kind: 'agent',
        label: 'PRD Writer',
        description: 'Draft a crisp PRD with user stories.',
        tools: ['notion'],
      },
    ],
    edges: [{ source: 0, target: 1 }],
  },
]
