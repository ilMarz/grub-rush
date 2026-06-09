# Agents

This repository is meant to be edited by two focused agents:

- Gameplay Mechanics Agent: game rules, controls, scoring, NPC behavior, collision, timers, and state flow.
- Visuals And Assets Agent: 3D models, animation presentation, lighting, UI, mobile readability, and asset licensing.

Both agents work from `docs/SPEC.md` and must keep the project deployable as a Next.js app on Vercel.

## Product Baseline

- Framework: Next.js App Router.
- Rendering: React Three Fiber and Three.js.
- Target: mobile-first browser game, with desktop keyboard fallback.
- Core loop: start a timed match, move the human player, collect items, compete against NPC collectors, avoid physical obstacles, show score and leaderboard, restart after time expires.

## Shared Rules

- Read the relevant source files before changing behavior or visuals.
- Keep gameplay logic and visual presentation loosely coupled.
- Preserve mobile playability after every meaningful change.
- Do not add paid, unclear-license, non-downloadable, or redistribution-prohibited assets.
- Record every third-party asset in `docs/ASSETS.md`.
- Run `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, and `pnpm.cmd run build` for production-affecting changes.

## Ownership Map

| Area | Primary Agent | Files / Folders |
| --- | --- | --- |
| Player movement, input mapping, collision, scoring, timers | Gameplay Mechanics | `src/components/game/CollectGame.tsx` |
| NPC spawning, NPC steering, item collection competition | Gameplay Mechanics | `src/components/game/CollectGame.tsx` |
| Character model loading, animation playback speed, GLB rendering | Visuals And Assets | `src/components/game/GlbCharacter.tsx` |
| Scene composition, lighting, materials, camera feel, HUD/control styling | Visuals And Assets | `src/components/game/CollectGame.tsx`, `src/components/game/CollectGame.module.css` |
| Static assets and licensing | Visuals And Assets | `public/assets/`, `docs/ASSETS.md` |
| Vercel readiness and build constraints | Both | `package.json`, `next.config.ts`, `docs/VERCEL.md` |

## Agent Files

- `docs/agents/gameplay-mechanics-agent.md`
- `docs/agents/visuals-assets-agent.md`

Each file contains the mission, owned files, boundaries, acceptance criteria, and a ready-to-copy prompt.

## Coordination

- If a task affects game feel and rendering at the same time, Gameplay Mechanics defines the target behavior first, then Visuals And Assets adjusts the presentation.
- If a visual asset changes scale, origin, or animation timing in a way that affects collision or fairness, Visuals And Assets must call this out for Gameplay Mechanics.
- If Gameplay Mechanics changes player speed, NPC speed, arena size, obstacle size, or collect radius, it must consider whether visual scale still reads correctly.
- Neither agent should rewrite unrelated code or revert changes made by the other agent.
