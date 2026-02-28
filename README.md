# AgentBuilder

AgentBuilder is a minimalist UI for designing agentic workflows on a visual canvas and generating LangGraph skeleton code. It targets non-technical users, technical builders, and founders who want to sketch an agent flow, assign tools, and export a starting codebase quickly.

## What You Can Do
- Add nodes and connect them on a canvas (roles include agent, tool, router, memory).
- Roles auto-expand by behavior (all nodes are agents, tools add tool, branching adds router, memory cues add memory).
- Describe each node in plain English, adjust roles if needed, and attach tools.
- Create conditional routes when a node has multiple outgoing edges.
- Start from templates for common workflows.
- Generate LangGraph skeleton code in Python or JS/TS.

## Stack
- React 19 + Vite + TypeScript
- React Flow for the canvas
- shadcn/ui + Tailwind CSS v4 for the UI

## Getting Started
```bash
bun install
bun dev
```

## Notes
- Code generation produces a scaffold, not a fully runnable app.
- Router behavior is stubbed; you supply the actual routing logic.

## More
- See `docs/FUTURE_FEATURES.md` and `docs/FUTURE_OUTLOOK.md` for planned ideas and known gaps.
