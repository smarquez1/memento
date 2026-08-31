# Memento

A calmer way to organize what matters today.

Memento is a mobile-first task organizer focused on noticing what was done
during the day, not only on what remains unfinished. Dark-only, local-first,
no account required.

## Built with

- **React 19** + **TypeScript 5.9** — UI and type safety
- **Vite 7** — build tool and dev server
- **Tailwind CSS 4** — styling
- **Dexie** — IndexedDB persistence
- **Biome** — linting, formatting, import sorting
- **Playwright** — browser verification
- **pnpm** — monorepo management

## Getting started

```sh
git clone git@github.com:smarquez1/memento.git
cd memento
pnpm install
pnpm dev
```

Open http://localhost:5173 in a mobile-sized viewport.

## Project structure

```
apps/web          React PWA — UI, persistence adapters, browser code
packages/core     Domain types and rules — no framework dependencies
e2e/              Playwright browser scenarios
docs/             Product plan and architecture decisions
.agents/skills/   Reusable AI agent instructions
```

## Available scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run Playwright browser tests |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run Biome linting |
| `pnpm format` | Format all files with Biome |
| `pnpm format:check` | Check formatting without writing |

## Architecture

Business rules live in `packages/core` as pure functions over immutable state.
The web app depends on core through a `TaskRepository` port interface, with
Dexie as the MVP adapter. This keeps the domain independent of React, Dexie,
browser APIs, and any future backend.

## License

[AGPL-3.0](LICENSE) — Anyone can use, modify, and distribute this software.
If you run it as a network service, you must publish the source code of your
modifications. See the license file for details.