# game-mobile-web

Mobile-first web game starter built with Vite + TypeScript. The app is a single
canvas (`src/game.ts`) with a render/update loop and pointer (touch/mouse) input;
dragging moves the green player circle. Entry point is `src/main.ts`, mounted into
`#app` in `index.html`.

## Cursor Cloud specific instructions

Standard commands live in `package.json` (`dev`, `build`, `preview`) and `README.md`.
Notes specific to this environment:

- **Single frontend service only.** There is no backend, database, or test suite.
  Run it with `npm run dev` (Vite dev server on port `5173`, bound to `0.0.0.0`
  via `server.host: true` in `vite.config.ts`).
- **"Lint" / type-check = `tsc`.** There is no ESLint config. Type safety is
  enforced by `tsc` (run standalone as `npx tsc --noEmit`, or as the first step of
  `npm run build`, which is `tsc && vite build`). Use this as the type/lint gate.
- **No automated tests exist.** Verify changes manually in the browser (open
  `http://localhost:5173/`, drag the circle) or by confirming `npm run build` passes.
