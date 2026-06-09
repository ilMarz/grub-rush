# Game Spec

## Product

`NPC Collect Run` is a mobile-first 3D browser game built with Next.js, React Three Fiber, and Three.js.

The player controls a human character in an obstacle-filled arena. Collectible items spawn during a timed match. NPCs compete against the player by collecting the same items. The goal is to finish with the highest score before time expires.

## MVP

- Single-player timed match.
- Human player character.
- Four visually distinct NPC characters.
- Collectible item spawning.
- Player and NPC scoring.
- Leaderboard.
- Physical walls and obstacles.
- Mobile touch D-pad.
- Desktop keyboard fallback.
- Start, time-up, and restart states.
- License-tracked downloadable assets.
- Vercel-compatible Next.js build.

## Non-Goals

- Multiplayer.
- Accounts.
- Online leaderboard.
- Persistent progression.
- Sound and music.
- Advanced NPC pathfinding.
- Full animation-state machine.

## Quality Gates

- The player moves only while input is active.
- Touch controls are usable on mobile.
- Keyboard controls work on desktop.
- NPCs can collect items and should not regularly freeze on obstacles.
- Player movement feels at least as responsive as NPC movement.
- NPCs are visually distinct from the player and each other.
- Characters render at believable scale.
- Every third-party asset is listed in `docs/ASSETS.md`.
- `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, and production build pass before handoff.

## Code Map

| File | Purpose |
| --- | --- |
| `src/app/page.tsx` | App entry, renders the game. |
| `src/components/game/CollectGame.tsx` | Gameplay loop, controls, NPCs, scoring, scene composition. |
| `src/components/game/CollectGame.module.css` | HUD, overlays, and mobile controls. |
| `src/components/game/GlbCharacter.tsx` | GLB character loading, cloning, animation playback, shadows. |
| `public/assets/characters/` | Player and NPC character assets. |
| `docs/ASSETS.md` | Asset manifest and license tracking. |
| `AGENTS.md` | Agent ownership and workflow. |

## Verification

Use these commands after code changes:

```bash
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
```
