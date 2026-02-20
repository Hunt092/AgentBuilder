# GraphBuilder

GraphBuilder is a minimalist UI for designing agentic workflows on a visual canvas and generating LangGraph skeleton code. It targets non-technical users, technical builders, and founders who want to sketch an agent flow, assign tools, and export a starting codebase quickly.

## What You Can Do
- Add nodes (agents, tools, routers, memory) and connect them on a canvas.
- Describe each node in plain English and assign tools.
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
- Router nodes are stubbed for conditional logic.
