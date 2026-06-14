# AGENTS.md

## Project Overview

**Playful** is a Next.js 15 (App Router) + React 19 landing page for a game-generation product. Single-page app with heavy canvas-based animation (GSAP, Framer Motion) and a multi-scene hero experience. No backend — purely a marketing site.

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Type check | `npx tsc --noEmit` (strict is OFF in tsconfig) |

No test suite exists. No CI workflows. No formatter configured.

## Architecture

- **`app/page.tsx`** — Main entry. Client component managing hero canvas, scroll-snap container, loading screen, and asset preloading.
- **`app/layout.tsx`** — Root layout loading 6 Google Fonts (Orbitron, Space Mono, Instrument Serif, Press Start 2P, Bebas Neue, Cinzel Decorative) as CSS variables.
- **`components/HeroCanvas.tsx`** — Core canvas renderer (~690 lines). Drives 5 scenes: Palace (image sequence, 145 frames), Retro, Racing, Open World, Space. Controls scroll-snap release to `SnapCards`.
- **`components/SnapCards.tsx`** — Post-hero scroll sections (video cards + arc cards). Becomes scrollable after hero release.
- **`components/PromptPanel.tsx`** — Rotating placeholder textarea (not currently wired into main page).
- **`hooks/`** — `useImageSequence`, `useSceneManager`, `useSnapScroll`.
- **`styles/globals.css`** — ~875 lines of CSS custom properties, keyframes, and utility classes. Design tokens defined in `:root`.
- **`public/`** — Static assets: palace frame sequence (145 `.webp` files), retro/racing/openworld/space scene images, card videos (`.mp4`).

## Key Conventions

- **Inline styles dominate.** Most components use React `style={{}}` objects, not Tailwind classes. `globals.css` has utility classes but they're used sparingly. When adding new components, match the inline-style pattern.
- **`'use client'`** is required on every component that uses hooks or browser APIs. The layout is the only server component.
- **`next/dynamic` with `{ ssr: false }`** is used for canvas/animation components to avoid SSR issues. Follow this pattern for any new client-only components.
- **CSS variables for fonts** are set via `className` on `<html>` in layout.tsx. Use `var(--font-orbitron)`, `var(--font-mono)`, etc. in styles.
- **No `next.config.js`** — uses Next.js defaults. If you add one, be aware of this.

## Gotchas

- **Asset preloading is critical.** `app/page.tsx` has `buildAssetList()` that preloads every image/video before the hero is revealed. If you add new assets referenced by scene components, you **must** add them to this list or you'll get flash-of-unstyled-content.
- **`strict: false`** in tsconfig — TypeScript won't catch many errors. Be careful with types.
- **Scroll-snap mechanics** are fragile. The hero canvas and scroll container share z-index space carefully. `pointerEvents` toggling controls whether the canvas or scroll container receives input. Don't change z-index values without understanding the stacking order (nav=2000, scroll-root=150, hero=100, loader=5000).
- **Scene transitions** are timed to specific constants in `HeroCanvas.tsx` (`SNAP_LOCK_MS = 900`, `SCENE_FADE_S = 0.85`). Changing one without the other causes visual glitches.

## File Layout

```
app/
  layout.tsx          # Root layout, fonts, metadata
  page.tsx            # Main page, loading, hero + scroll container
components/
  HeroCanvas.tsx      # Canvas-based scene renderer
  SnapCards.tsx        # Post-hero scroll sections
  PalaceScene.tsx      # Frame-based palace scene
  RetroSequence.tsx    # Retro platformer scene
  RacingSequence.tsx   # Racing scene
  OpenWorldSequence.tsx# Open world scene
  SpaceSequence.tsx    # Space scene
  LoadingAnimation.tsx # Loading screen
  PromptPanel.tsx      # Prompt input (unused in main page)
  GlassFooter.tsx      # Footer component
  SceneManager.tsx     # Alternate scene manager (not used in main page)
  SceneStage.tsx       # Alternate scene staging
hooks/
  useImageSequence.ts  # Palace frame preloading
  useSceneManager.ts   # Scene index management
  useSnapScroll.ts     # Scroll-snap behavior
styles/
  globals.css          # Design tokens, keyframes, utilities
public/
  palace/              # 145 .webp palace frames
  retro/               # Retro scene assets
  racing/              # Racing scene assets
  openworld/           # Open world scene assets
  space/               # Space scene assets
  cards/               # Card section videos
```
