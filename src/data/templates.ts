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
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Turn generated scripts into narration-ready audio.',
    category: 'automation',
  },
  {
    id: 'mindmap-generator',
    name: 'Mindmap Generator',
    description: 'Convert key ideas into a structured mindmap outline.',
    category: 'research',
  },
]

export const TEMPLATES: GraphTemplate[] = [
  {
    id: 'research-sprint',
    name: 'Research Sprint',
    description: 'Research -> gather sources -> synthesize in one pass.',
    nodes: [
      {
        roles: ['agent'],
        label: 'Lead Researcher',
        description: 'Define scope, questions, and guardrails.',
        tools: ['web-search'],
      },
      {
        roles: ['tool'],
        label: 'Source Collector',
        description: 'Pull relevant sources and surface citations.',
        tools: ['web-search'],
      },
      {
        roles: ['agent'],
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
    id: 'support-triage-copilot',
    name: 'Support Triage Copilot',
    description: 'Triage incoming tickets -> resolve -> sync CRM and memory.',
    nodes: [
      {
        roles: ['agent', 'router'],
        label: 'Ticket Intake Router',
        description: 'Classify urgency and choose the right resolution path.',
        tools: ['ticketing', 'doc-summarizer'],
      },
      {
        roles: ['agent'],
        label: 'Urgent Resolver',
        description: 'Handle high-priority tickets with fast response and escalation.',
        tools: ['email', 'calendar'],
      },
      {
        roles: ['agent'],
        label: 'Standard Resolver',
        description: 'Handle standard support requests with consistent quality.',
        tools: ['email'],
      },
      {
        roles: ['tool', 'memory'],
        label: 'CRM and Memory Sync',
        description: 'Persist outcomes and context for future follow-ups.',
        tools: ['crm-update', 'notion'],
      },
      {
        roles: ['tool'],
        label: 'Ticket Update',
        description: 'Write final status and notes back to the ticketing system.',
        tools: ['ticketing'],
      },
    ],
    edges: [
      { source: 0, target: 1, routeKey: 'urgent' },
      { source: 0, target: 2, routeKey: 'standard' },
      { source: 1, target: 3 },
      { source: 2, target: 3 },
      { source: 3, target: 4 },
    ],
  },
  {
    id: 'notebook-research-assistant',
    name: 'Notebook Research Assistant',
    description: 'Ingest sources -> build notes -> answer with citations -> podcast or mindmap.',
    nodes: [
      {
        roles: ['agent'],
        label: 'Source Ingestor',
        description: 'Collect docs, links, and transcripts for a research notebook.',
        tools: ['web-search'],
      },
      {
        roles: ['tool', 'memory'],
        label: 'Notebook Memory',
        description: 'Store indexed notes, chunks, and citation metadata.',
        tools: ['db-query', 'notion'],
      },
      {
        roles: ['agent', 'router'],
        label: 'Question Router',
        description: 'Route questions to quick answer or deep synthesis paths.',
        tools: ['doc-summarizer'],
      },
      {
        roles: ['agent'],
        label: 'Quick Answer',
        description: 'Generate concise responses from existing notebook context.',
        tools: ['doc-summarizer'],
      },
      {
        roles: ['agent'],
        label: 'Deep Synthesis',
        description: 'Run broader synthesis for complex or open-ended questions.',
        tools: ['web-search', 'doc-summarizer'],
      },
      {
        roles: ['agent'],
        label: 'Cited Response',
        description: 'Compose a grounded response and a structured brief for output formats.',
        tools: ['doc-summarizer'],
      },
      {
        roles: ['agent'],
        label: 'Podcast Producer',
        description: 'Generate an episode script and audio handoff from the research brief.',
        tools: ['text-to-speech', 'webhook'],
      },
      {
        roles: ['agent'],
        label: 'Mindmap Builder',
        description: 'Create a visual hierarchy of topics, insights, and source links.',
        tools: ['mindmap-generator', 'notion'],
      },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 2, target: 3, routeKey: 'quick' },
      { source: 2, target: 4, routeKey: 'deep' },
      { source: 3, target: 5 },
      { source: 4, target: 5 },
      { source: 5, target: 6, routeKey: 'podcast' },
      { source: 5, target: 7, routeKey: 'mindmap' },
    ],
  },
]
