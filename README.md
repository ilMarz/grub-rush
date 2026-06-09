# Grab Rush

A ready-to-use Next.js 3D game repository designed to be evolved by focused coding agents.

The game is a mobile-first collection match: the player controls a human character, collects spawned items, and competes against NPCs that collect the same items while navigating physical obstacles.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

```bash
pnpm build
pnpm start
pnpm lint
pnpm typecheck
```

## Repository Structure

```text
AGENTS.md                         Agent ownership and workflow
docs/SPEC.md                      Product and technical spec
docs/ASSETS.md                    Asset manifest and licenses
docs/VERCEL.md                    Vercel deployment notes
docs/agents/
  gameplay-mechanics-agent.md     Gameplay agent prompt and boundaries
  visuals-assets-agent.md         Visual/assets agent prompt and boundaries
src/app/                          Next.js App Router entry
src/components/game/              Game implementation
public/assets/characters/         Player and NPC GLB assets
```

## Agent Workflow

This repo is intentionally split into two agent workstreams:

- Gameplay Mechanics Agent: movement, controls, collision, scoring, timer, NPC behavior, spawning, fairness.
- Visuals And Assets Agent: GLB characters, animation presentation, lighting, HUD, mobile controls, assets, licensing.

Use `AGENTS.md` first, then open the specific file under `docs/agents/`.

For example:

```text
Use docs/agents/gameplay-mechanics-agent.md.
Task: improve NPC obstacle avoidance without changing character models or UI.
Follow docs/SPEC.md and verify with typecheck, lint, and build.
```

```text
Use docs/agents/visuals-assets-agent.md.
Task: improve arena visual readability on mobile without changing scoring or NPC behavior.
Follow docs/SPEC.md and update docs/ASSETS.md for any new assets.
```

## Verification

Run these before handing off meaningful changes:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## LinkedIn Summary

This repository demonstrates an agent-ready game architecture:

- one playable Next.js 3D game;
- one concise product spec;
- two specialized agent files with clear ownership;
- explicit boundaries between gameplay and visuals;
- license-tracked downloadable assets;
- Vercel-ready verification commands.

The key idea: instead of asking a generic agent to modify everything, the repo gives each agent a narrow role, owned files, forbidden areas, and acceptance criteria.
