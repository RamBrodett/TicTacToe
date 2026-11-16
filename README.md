# Wood & Gear: Tic-Tac-Toe

A two-player, same-device tic-tac-toe game with a 2D hyper-realistic look. X is a pair of crossed oak planks and O is a rusty steel gear. Every asset, the board and the workshop backdrop are drawn in SVG, using procedural textures and lighting filters. It works on phones and desktops.

## Modes
- **Classic**: get three in a row. If the board fills with no winner, it's a draw.
- **Shifting**: each player keeps at most 3 pieces. When you place a 4th piece, your oldest one vanishes. The piece that will vanish next is shown cracked and pulsing. If nobody wins within 30 moves, it's a draw.

The scoreboard (Wood wins, Draws, Gear wins) is saved on the device. The starting player alternates every round.

## Run locally
```bash
npm install
npm run dev     # http://localhost:3000
npm test        # game-logic unit tests (vitest)
npm run build   # production build (fully static)
```

## Stack and libraries
| Library | Why |
|---|---|
| Next.js 16 (App Router) + React 19 | The page is prerendered as static, so no server is needed. |
| Tailwind CSS 4 | Layout, responsive breakpoints and theme tokens. |
| SVG filters (no library) | `feTurbulence` creates wood grain, rust and brushed steel. Diffuse and specular lighting create bevels and metal sheen. |
| `motion` | Place, vanish, win-line and pulse animations. Respects `prefers-reduced-motion`. |
| Web Audio API | Synthesized knock, clank and chime sounds. There are no audio files. |
| `vitest` | Unit tests for `src/lib/game.ts`. |

Not used on purpose: LittleJS, PixiJS and Phaser render to a canvas. That would lose the crisp SVG scaling, the accessible DOM buttons and Tailwind styling, and a turn-based game doesn't need a game loop.

## How it's built (UI and interaction)
- Each screen has one primary action, and the result and the board stay visible together.
- Turns are shown three ways: the marker icon, the player name and a glow, so color is never the only cue. Hovering an empty cell previews your piece.
- Cells are real buttons of at least 44 px. Arrow keys move between cells and Enter or Space places a piece. Status changes are announced to screen readers through an `aria-live` region.

## Code map
- `src/lib/game.ts`: pure rules (both modes) and the reducer
- `src/lib/persistent.ts`: scores and mute setting saved in localStorage
- `src/lib/sound.ts`: Web Audio sound effects and haptics
- `src/components/SvgDefs.tsx`: shared SVG filters and gradients
- `src/components/markers/`: the wood X, the gear O and the crack overlay
- `src/components/Board.tsx`: the plate, the cells, animations and the win line
- `src/components/Hud.tsx`: player cards, the score row, the mode toggle and the status line
- `src/components/Game.tsx`: page layout and state

## Deploy to Vercel
There are no environment variables. Either:
```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production
```
or push to GitHub and import the repository at vercel.com/new.
