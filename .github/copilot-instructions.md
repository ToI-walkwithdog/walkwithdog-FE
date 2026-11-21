# Project rules

## What this project is
- This is a **mobile app UI** (dog-walking volunteer app "이어주개"), NOT a responsive website.
- Design source of truth is the Figma file (use the Figma MCP). Follow it exactly.

## Layout (most important)
- Root container, backgrounds, and bottom sheets always fill the full screen width. Content keeps Figma dp sizes inside a centered 375-wide frame. Anchor bottom sheets and bottom bars to the screen bottom and position related items relative to them, not to the screen top.
- Do NOT use media queries, breakpoints, `vw`, `clamp()`, or `flex-wrap` for content layout. Use `width: '100%'` only for full-width root, background, bottom sheet, and bottom bar containers.
- Use the exact px values (size, spacing, font size, radius) from Figma.
- If the Figma frame size differs from 375px, follow the Figma frame size.

## Scope
- Do not add screens, features, elements, or animations that are not in the Figma design.
- Do not redraw or recreate icons/images by hand. Use the exported assets in `src/assets/`.
- Do not refactor or restyle code that was not part of the request.

## Structure (under `src/`)
- `app/` – Expo Router route files only; re-export screens from `screens/`
- `assets/icons/` – SVG icons (kebab-case names, `stroke`/`fill` set to `currentColor`)
- `assets/images/` – photos and illustrations
- `assets/fonts/` – local font files
- `components/` – reusable React Native components
- `screens/` – screen components grouped by flow
- `theme/` – `tokens.ts` and typography helpers
- `data/` – typed mock data
- `hooks/`, `utils/`, `types/`

## Styling
- Use React Native `StyleSheet.create`.
- Read colors, fonts, radius, and spacing from `src/theme/tokens.ts`. Do not hard-code values already defined there.
- Images use a single high-resolution file (name.png, exported at 4x). Do not create @1x/@2x/@3x variants.
- UI text is Korean. Code, file names, and comments are English.
