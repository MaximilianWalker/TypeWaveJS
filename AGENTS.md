This directory follows the global AGENTS.md at `~/.config/opencode/AGENTS.md`.
Only project-specific constraints are defined here.

# TypeWaveJS Repo Rules

## 1) Project Scope

- This repository is an npm workspace monorepo (`packages/*`).
- `packages/react` is the active package and should be treated as the primary implementation target.
- `packages/vanilla` is currently a placeholder package; do not expand it unless explicitly requested.

## 2) Editing Boundaries

- Make behavior changes in `packages/react/src/**` and tests in `packages/react/src/**/*.test.jsx`.
- Do not hand-edit generated artifacts in `packages/react/dist/**`; regenerate with the build command when needed.
- Avoid unrelated changes to root automation scripts (`scripts/publish.js`, `scripts/examples.js`) unless the task is specifically about release/examples workflow.
- Avoid unnecessary lockfile churn; update `package-lock.json` only when dependency or script changes require it.

## 3) Validation Expectations

Use the smallest relevant check first, then expand scope when needed.

- Package-level checks (default):
  - `npm --workspace @typewavejs/react run test`
  - `npm --workspace @typewavejs/react run build`
- Workspace-level checks (when root/shared behavior changes):
  - `npm run test`
  - `npm run build`

## 4) Architecture Guardrails

- Keep the event-driven animation model centered around `packages/react/src/typewave.jsx` and `packages/react/src/utils/eventsUtils.jsx`.
- Preserve package boundaries; do not add hidden coupling between `@typewavejs/react` and `@typewavejs/vanilla`.
- Prefer minimal, deterministic diffs over broad refactors in this codebase.
