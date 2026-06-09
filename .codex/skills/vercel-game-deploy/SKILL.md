---
name: vercel-game-deploy
description: Prepare and verify this Next.js React Three Fiber game for Vercel deployment. Use when checking build scripts, App Router setup, static asset paths, GLB asset loading, environment variables, docs/VERCEL.md, production build, local preview, or deploy readiness for Grab Rush.
---

# Vercel Game Deploy

Use this skill to keep the game deployable as a simple Vercel-hosted Next.js app.

## Workflow

1. Inspect `package.json`, `next.config.ts`, `src/app/`, and `docs/VERCEL.md`.
2. Confirm static assets use Vercel-safe public URLs under `public/assets/`.
3. Confirm client-only gameplay remains in client components.
4. Check whether environment variables or external services are required.
5. Run verification when relevant:
   - `pnpm.cmd run typecheck`
   - `pnpm.cmd run lint`
   - `pnpm.cmd run build`
6. If the user needs to test locally, start or restart a local preview and verify HTTP 200.
7. Update `docs/VERCEL.md` if scripts, assets, env vars, or deployment constraints change.

## Current Deployment Shape

- Framework preset: Next.js.
- Package manager: pnpm.
- Build command: `pnpm build`.
- Start command: `pnpm start`.
- Required environment variables: none.
- Runtime services: none.
- Gameplay state: client-side.
- Static character assets: `public/assets/characters/`.

## Deployment Rules

- Do not introduce stateful server assumptions for the single-player MVP.
- Keep API handlers optional and stateless if added later.
- Keep large assets under `public/assets/` unless a CDN decision is explicitly made.
- Verify GLB paths after asset changes.
- Keep Vercel docs short and operational.

## Acceptance Criteria

- Typecheck, lint, and production build pass.
- No missing required environment variables.
- Game page loads from local preview.
- Asset URLs resolve from `public/`.
- `docs/VERCEL.md` matches the actual app.
