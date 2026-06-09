# Vercel Readiness

## Build

- Framework preset: Next.js.
- Install command: `pnpm install`.
- Build command: `pnpm build`.
- Output directory: Vercel-managed Next.js output.

## Runtime

- Required environment variables: none for the current MVP.
- API routes: none for the current MVP.
- External services: none for the current MVP.
- Real-time provider: none.
- Persistence provider: none.

## 3D Assets

- Static assets live under `public/assets/`.
- Current player character: `public/assets/characters/cesium-man.glb`.
- Current NPC characters:
  - `public/assets/characters/quaternius-adventurer.glb`
  - `public/assets/characters/quaternius-king.glb`
  - `public/assets/characters/quaternius-farmer.glb`
  - `public/assets/characters/quaternius-hoodie.glb`
- Asset manifest: `docs/ASSETS.md`.

## Verification Checklist

- Loads on desktop.
- Loads on mobile viewport.
- Start flow works.
- Touch D-pad controls move the player.
- Keyboard fallback moves the player.
- Player can collect items.
- NPCs can collect items.
- Obstacles block movement.
- Timer ends the match.
- Restart works.
- Asset URLs resolve.
- Console has no blocking errors.
