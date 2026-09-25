# BGL Básculas

SSR site for [BGL Básculas Industriales](https://bglbasculas.com.mx). Pages, services, clients, and products come from a self-hosted Directus CMS. The app is Next.js and React. The package manager is pnpm.

Node version: [.nvmrc](.nvmrc).

## Start

1. Copy `.env.example` to `.env` and fill it in.
2. `pnpm i`
3. `pnpm dev` — http://localhost:3000
4. `pnpm storybook` — http://localhost:6006

## Commands

| Command                | What it runs                                      |
| ---------------------- | ------------------------------------------------- |
| `pnpm dev`             | `next dev`                                        |
| `pnpm storybook`       | Storybook on port 6006                            |
| `pnpm typegen`         | `next typegen`                                    |
| `pnpm typecheck`       | `tsc --noEmit`                                    |
| `pnpm lint`            | `eslint`                                          |
| `pnpm format`          | Prettier                                          |
| `pnpm build`           | `next build`                                      |
| `pnpm build-storybook` | Storybook build                                   |
| `pnpm start`           | `next start`                                      |
| `pnpm pre-deploy`      | `typegen`, `typecheck`, `lint`, `format`, `build` |
| `pnpm reset`           | Clean install (`clean --lockfile`)                |

## Layout

- `app/` — routes
- `components/` — UI, blocks, shared
- `services/domain/db/` — Directus queries and repositories
- `config/` — Directus, Arcjet, CSP, Meilisearch, Redis, rate limit
- `lib/` — helpers
- `i18n/` — Spanish catalogs
- `stories/` — Storybook
- `types/` — CMS types

Health check: `GET /health`.

## Docs

- [AGENTS.md](AGENTS.md) — instructions for coding agents
- [DESIGN.md](DESIGN.md) — visual system for agents
- [SECURITY.md](SECURITY.md) — reporting and controls
- [LICENSE](LICENSE) — closed license
