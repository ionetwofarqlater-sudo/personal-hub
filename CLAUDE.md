# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run lint         # ESLint (next lint .)
npm run format       # Prettier format all files
npm run format:check # Check formatting without writing
```

Run a single lint check on a specific file:

```bash
npx eslint src/path/to/file.ts
```

There are no automated tests. The pre-commit hook (Husky + lint-staged) runs Prettier on staged JS/TS/JSON/CSS/MD files and ESLint on TS/JS files.

## Architecture

**Personal Hub** is a self-hosted personal productivity dashboard. Next.js 15 App Router, React 19, Tailwind CSS, PostgreSQL (direct SQL via `postgres` npm package — no ORM), NextAuth.js v5 (JWT strategy, credentials provider).

### Auth

- Config: `src/auth.ts` — NextAuth credentials provider with bcrypt password verification
- Handlers: `src/app/api/auth/[...nextauth]/route.ts`
- Registration: `src/app/api/auth/register/route.ts` (POST, normalizes email to lowercase)
- Session JWT carries `id` and `role` fields
- Middleware at `src/middleware.ts` protects `/dashboard/*` routes; `/dashboard/admin` additionally requires `role === 'admin'`

### Database

- Connection singleton: `src/lib/db.ts` — reads `DATABASE_URL` env var, optional `DATABASE_SSL`
- Query pattern: tagged template literals — `` await sql`SELECT ...` ``
- Schema: `migrations/001_init.sql` — two tables: `users` and `saved_items`
- `saved_items` supports: content types (text/link/file/image/voice), tags (array), pinning, favoriting, reply threading (self-ref `reply_to`), soft deletes (`deleted_at`), JSONB metadata, reminders

### Core Feature: Saved Items

```
src/app/dashboard/saved/
├── page.tsx           # Server component — fetches initial 100 items
├── SavedClient.tsx    # Client component — full state management
├── components/        # Feed, Composer, Bubble, LinkPreview, Filters, SearchBar
└── hooks/
    ├── useSavedItems.ts   # CRUD + bulk ops via /api/saved routes
    └── useSavedSearch.ts  # Client-side FTS + filter state
```

API routes under `src/app/api/saved/` handle create/read/update/delete. OG preview scraping is at `src/app/api/og-preview/`.

### App Grid System

`src/lib/apps.ts` exports `AppDefinition` objects that appear as cards on the dashboard. Add new features here; `src/components/dashboard/AppGrid.tsx` renders them.

### Deployment

Multi-stage Docker build (`Dockerfile`) → standalone Next.js server. `docker-compose.yml` runs: Next.js app, PostgreSQL 16, MinIO (S3-compatible storage), Cloudflare Tunnel, and a one-shot `migrate` service that runs `migrations/001_init.sql` on first start.

Copy `.env.compose.example` to `.env.compose` and fill in all values. Required: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` (public domain via Cloudflare Tunnel), `POSTGRES_*`, `MINIO_*`, `CLOUDFLARE_TUNNEL_TOKEN`.

Update the image name in `docker-compose.yml` (`ghcr.io/YOUR_GITHUB_USERNAME/personal-hub:latest`) to match your GitHub Container Registry or local build tag.

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).
