# Repository Guidelines

## Product Mission & Direction
AgentBuilder should make workflow creation easy: users focus on the use case, and the product handles scaffolding. Keep it framework-agnostic toward fuller generation over time.

## Project Structure & Module Organization
- `src/`: application code.
- `src/components/`: feature components and UI primitives in `src/components/ui/`.
- `src/lib/`: domain logic, normalization/inference, code generation, shared types.
- `src/data/`: templates and seed data.
- `public/`: static assets.
- `docs/`: product and roadmap notes.

Use `@/` imports for `src` aliases.

## Build, Test, and Development Commands
Use Bun (`bun.lockb`):
- `bun install`: install dependencies.
- `bun dev`: run local dev server.
- `bun run lint`: run ESLint.
- `bun run build`: run production build.
- `bun run preview`: preview production output.

## Engineering Standards & Naming
- TypeScript strict mode is required.
- Use 2-space indentation and single quotes.
- Components use `PascalCase` filenames/exports (`FlowNode.tsx`).
- Utility/data modules use `camelCase` filenames (`edgeNormalization.ts`).
- Avoid `any`; prefer shared types from `src/lib/types.ts`.
- Keep code clean and maintainable: small focused functions, explicit responsibilities, low coupling.
- Run `bun run lint` before opening a PR.

## Documentation Standards
- Add concise docstrings/comments for complex or non-obvious logic (branching, normalization, generator behavior).
- Explain intent, assumptions, and invariants; do not restate obvious code.
- Document extension points where new codegen providers/framework targets can plug in.

## Testing Standards
No automated test runner is configured yet.

Testing policy is **best effort**: add tests with feature work when feasible; if not feasible, include a short rationale in the PR. Use `ComponentName.test.tsx` and `moduleName.test.ts` naming. Prioritize `src/lib/*` behavior and user-critical flows.

## UI/UX and Speed Priorities
- UX and responsiveness are top priorities.
- Keep canvas/editor workflows obvious and low-friction.
- Avoid changes that introduce lag, heavy re-renders, or unnecessary interaction steps.

## Code Generation Extensibility
- Use a provider-interface-first design for code generation.
- Add framework targets through isolated providers/adapters, not editor rewrites.
- Keep generator inputs/outputs stable and framework-neutral so other projects can reuse the codegen layer.

## Commit & Pull Request Guidelines
Use Conventional Commits with scope: `type(scope): short imperative summary` (for example, `feat(App): improve edge routing`).

PRs should include:
- Behavior summary.
- Issue link.
- Screenshots/recordings for UI changes.
- Validation notes (`bun run lint`, build, manual flow checks).
- Test evidence or omission rationale.
- Docstring/comment coverage for complex logic touched.
- UX impact narrative for UI-related changes.
