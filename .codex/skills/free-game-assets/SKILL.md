---
name: free-game-assets
description: Source, evaluate, download, integrate, and document free game assets for Grab Rush. Use when selecting or changing GLB/GLTF character models, animations, textures, icons, sounds, fonts, UI assets, or any downloadable third-party resource that must be license-clear and recorded in docs/ASSETS.md.
---

# Free Game Assets

Use this skill whenever the game needs third-party assets.

## Workflow

1. Identify the exact asset need: character, animation, texture, icon, sound, font, or UI asset.
2. Prefer permissive licenses: CC0, Public Domain, MIT, Apache-2.0, OFL, or similarly permissive terms.
3. Verify the license from the source page before download.
4. Download only from the official source or a trusted source linked by it.
5. Store assets under `public/assets/`.
6. Record metadata in `docs/ASSETS.md` before or during integration.
7. Run build verification after asset path or loader changes.

## License Rules

- Treat missing license information as unusable.
- Treat "free for personal use" as unusable.
- Do not use scraped imagery, copyrighted game rips, fan art, unclear AI-gallery assets, or redistribution-prohibited assets.
- Preserve exact attribution requirements when a license requires attribution.
- Prefer CC0/Public Domain assets for character and prototype art when possible.

## Asset Manifest

Maintain `docs/ASSETS.md` with:

- Asset name.
- Type.
- Source URL.
- Download URL.
- Author.
- License.
- Attribution requirement.
- Local path.
- Notes or restrictions.

## Character Asset Guidance

- Prefer optimized `.glb` or `.gltf`.
- Validate character scale before handing off.
- NPCs must remain visually distinct from the player and each other.
- Avoid procedural block characters unless explicitly requested for debugging.
- If animation playback changes visual speed only, coordinate with the Visuals And Assets Agent; if it changes fairness, coordinate with Gameplay Mechanics.

## Acceptance Criteria

- Asset source and license are documented.
- Asset is downloadable and stored in `public/assets/`.
- Runtime paths use `/assets/...`.
- Build passes after integration.
