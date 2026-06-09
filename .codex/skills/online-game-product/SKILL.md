---
name: online-game-product
description: Scope and maintain the product spec for this agent-ready Next.js browser game. Use when defining or updating NPC Collect Run gameplay, MVP scope, controls, core loop, scoring, NPC behavior, agent boundaries, acceptance criteria, README usage, LinkedIn-ready repo explanation, or documentation under AGENTS.md and docs/SPEC.md.
---

# Online Game Product

Use this skill to keep the repository product direction clear and agent-ready.

## Workflow

1. Read `docs/SPEC.md`, `AGENTS.md`, and `README.md`.
2. Confirm the request fits the current product: mobile-first 3D NPC collection game.
3. Update only the smallest relevant docs:
   - `docs/SPEC.md` for product scope, MVP, quality gates, and code map.
   - `AGENTS.md` for cross-agent ownership and coordination.
   - `docs/agents/*.md` for one agent's prompt, boundaries, or acceptance criteria.
   - `README.md` for setup, repository explanation, and public-facing usage.
4. Keep the repo explanation concise and usable by someone cloning it fresh.
5. Remove stale documentation instead of adding parallel docs.

## Product Baseline

- Game name: `NPC Collect Run`.
- Framework: Next.js App Router.
- Rendering: React Three Fiber and Three.js.
- Mode: single-player.
- Target: mobile-first browser gameplay with keyboard fallback.
- Core loop: start timed match, move human player, collect items, compete against NPC collectors, avoid obstacles, compare scores, restart.
- Agent model: two focused agents, Gameplay Mechanics and Visuals And Assets.

## Documentation Rules

- Prefer one canonical spec: `docs/SPEC.md`.
- Keep agent instructions in `AGENTS.md` and `docs/agents/`.
- Do not reintroduce removed legacy product directions.
- Do not create broad planning docs when a concise README or spec edit is enough.
- Keep LinkedIn-facing language in `README.md` short, concrete, and repo-structure focused.

## Acceptance Criteria

- A new contributor can understand how to run the game.
- A new agent can identify which files it owns.
- The spec matches the current playable game.
- No stale product direction remains in docs.
