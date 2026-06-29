# game-mobile-web

Mobile-first web game starter built with Vite and TypeScript.

## Getting started

```bash
npm install
npm run dev
```

Open the dev server URL on a phone or in mobile emulation. Drag on the canvas to move the player.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run preview` | Preview production build |

## Project structure

```
├── index.html      # Mobile viewport and shell
├── src/
│   ├── main.ts     # App entry point
│   └── game.ts     # Canvas game loop and touch input
├── vite.config.ts
└── tsconfig.json
```
