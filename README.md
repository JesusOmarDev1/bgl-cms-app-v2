# BGL BASCULAS OFICIAL WEB

![NextJS](https://img.shields.io/badge/Nextjs-16.3.4-000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node-24.18.0-5FA04E?logo=nodedotjs&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4.4.3-3E67B1?logo=zod&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.100.14-FF4154?logo=reactquery&logoColor=white)
![TanStack Form](https://img.shields.io/badge/TanStack_Form-1.33.5-FF4154?logo=reactquery&logoColor=white)
![TanStack Virtual](https://img.shields.io/badge/TanStack_Virtual-3.14.10-FF4154?logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0.14-433E38?logo=react&logoColor=white)
![Directus](https://img.shields.io/badge/Directus_SDK-20.3.0-263238?logo=directus&logoColor=white)
![Meilisearch](https://img.shields.io/badge/Meilisearch-0.60.0-FB2BBD?logo=meilisearch&logoColor=white)
![Arcjet](https://img.shields.io/badge/Arcjet-1.10.0-000?logo=react&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-10.6.0-8D16D5?logo=storybook&logoColor=white)
![Shadcn/ui](https://img.shields.io/badge/Shadcn/ui-4.19.0-000?logo=shadcnui&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-12.3.4-F69220?logo=pnpm&logoColor=white)
![vite](https://img.shields.io/badge/vite-8.2.2-FB2BBD?logo=vite&logoColor=white)

SSR web platform for **BGL Básculas Industriales**, managing dynamic content for pages, services, clients and products through Directus CMS. Built on Next JS 16 + React 19, deployed via Nixpacks.

**Site:** [https://bglbasculas.com.mx](https://bglbasculas.com.mx)

## 🚀 Quick Start

### Prerequisites

- **Self Hosted** & **Nixpacks** (recommended)
- Or: **Node.js 24.14+** and **pnpm 12.3.4+**

### Option 1: Local Installation

```bash
pnpm install && pnpm pre-deploy
cp .env.example .env       # edit with your credentials
pnpm dev
pnpm storybook
open http://localhost:3000
open http://localhost:6006
```

## 📦 Available Commands

```bash
# Development
pnpm dev              # next dev — development server at localhost:3000
pnpm storybook        # storybook dev — development server at localhost:6006

# Validation
pnpm lint             # eslint
pnpm format           # prettier --write \"**/*.{ts,tsx,mjs,json}\"
pnpm typecheck        # tsc --noEmit
pnpm typegen          # next typegen

# Production
pnpm build            # next build
pnpm build-storybook  # storybook build
pnpm start            # next start

# Pre-deploy (full pipeline)
pnpm pre-deploy       # pnpm typegen && pnpm typecheck && pnpm lint && pnpm format && pnpm build

# Utilities
pnpm next --help      # help commands
pnpm reset            # clean --lockfile
```

## 🏗️ Architecture

```
src/
├── types/           → TypeScript types for blocks, collections, singletons, enums
├── server/          → NextJS Actions (form submit + Meilisearch search)
├── assets/          → SVG icons (social, payment, AI, docs)
├── components/      → Blocks, collections, UI (shadcn/ui), shared, singleton
├── config/          → Directus client, Arcjet, Meilisearch, LRU Cache, Security
├── hooks/           → React hooks (debounce, scroll, audio, catalog, …)
├── lib/             → Utilities: Directus helpers, formatting, sanitize, slugs, TOC
├── services/        → Repository pattern (services/repositories + services/queries + services/fields)
├── styles/          → global.css, theme.css (OKLCH), animations.css, typeset.css
```

### Health Check

Available at `GET /health`.

## 📚 Documentation

| Document                     | Description                              |
| ---------------------------- | ---------------------------------------- |
| [AGENTS.md](AGENTS.md)       | Guidelines for AI agents in this repo    |
| [CLAUDE.md](CLAUDE.md)       | Redirecting guidelines for AI agents     |
| [DESIGN.md](DESIGN.md)       | Architecture decisions and design system |
| [SECURITY.md](SECURITY.md)   | Security policies and headers            |
| [CHANGELOG.md](CHANGELOG.md) | Release history                          |

## 📄 License

Closed License — see [LICENSE](LICENSE) for details.

---

**Developed with ❤️ for BGL Básculas Industriales**
