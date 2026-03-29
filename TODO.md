# TODO — Personal Hub

> Updated: 2026-03-29

## P0 — Blockers

- [ ] **Replace Supabase Auth** with self-hosted solution (NextAuth.js v5 + postgres adapter)
  - remove `@supabase/ssr`, `@supabase/supabase-js` deps
  - rewrite `src/lib/supabase/` → `src/lib/auth/`
  - rewrite `src/middleware.ts` (session check)
  - rewrite all auth pages: login, forgot-password, update-password, verify-email, callback
- [ ] **Replace Supabase DB** with direct postgres (pg / postgres.js)
  - rewrite `src/app/dashboard/saved/` hooks and server page
  - write SQL migrations (currently only in supabase/migrations)
- [ ] **GitHub Actions** — replace `deploy-vercel.yml` with docker build + push to ghcr.io
- [ ] **docker-compose.yml** — replace image placeholder `YOUR_GITHUB_USERNAME`
- [ ] Set up Cloudflare Tunnel and get `CLOUDFLARE_TUNNEL_TOKEN`

---

## Infrastructure

- [ ] Register domain or decide on subdomain for Cloudflare Tunnel
- [ ] Set up Cloudflare Access (OAuth gate — so only you can open the site)
- [ ] Create Portainer stack from `docker-compose.yml`
- [ ] Configure postgres volume backups (cron + dump to MinIO)
- [ ] Write `.env.compose` from `.env.compose.example` on the server (never commit it)

---

## Cleanup — Dead Code

- [ ] Delete `src/app/dashboard/notes/page.tsx` — uses localStorage, will be replaced by Saved
- [ ] Delete `src/app/dashboard/clouddrop/page.tsx` — uses localStorage, will be replaced by Saved
- [ ] Remove old localStorage modules from `src/lib/apps.ts` references
- [ ] Remove Supabase scripts: `scripts/check-supabase-cors.mjs`, `scripts/check-client-env.mjs`
- [ ] Remove Vercel env vars from `next.config.mjs` (`NEXT_PUBLIC_VERCEL_*`)
- [ ] Remove `supabase/` directory after migration is done
- [ ] Remove `pre-deploy.ps1`, `pre-deploy.sh` (Vercel-specific)

---

## Auth (post-migration)

- [ ] Email + password login
- [ ] Email verification flow
- [ ] Forgot / reset password
- [ ] Session management (active sessions list, logout all)
- [ ] MFA (TOTP) — optional, add after basic auth works
- [ ] Rate limiting on login + forgot-password (reuse `src/lib/auth/rateLimit.ts` logic)

---

## Admin

- [ ] User list (id, email, role, created_at, status)
- [ ] Block / unblock user
- [ ] Force logout user (invalidate sessions)
- [ ] Reset MFA for user
- [ ] Admin audit log (`admin_audit_log` table: actor_id, action, target_user_id, created_at)
- [ ] RLS-equivalent policies at app layer (postgres row-level or app middleware)

---

## Saved module (core product)

- [ ] Migrate `saved_items` to self-hosted postgres (SQL migration file)
- [ ] Add `user_settings` table
- [ ] Soft delete working (`deleted_at`)
- [ ] Pagination or infinite scroll (currently `LIMIT 100`)
- [ ] File/image attachments via MinIO
- [ ] Quick-add `+` button from dashboard

---

## CI/CD

- [ ] GitHub Action: `lint` → `build` → `docker build` → `docker push ghcr.io`
- [ ] Portainer webhook for auto-redeploy on new image
- [ ] Keep `ci.yml` for lint + build check on PRs

---

## Quality

- [ ] Zod validation on all form inputs + API routes
- [ ] Centralized error handling for API routes
- [ ] Remove any `console.log` from prod paths
- [ ] Add `knip` to find unused exports/files

---

## Tests (after migration stabilizes)

- [ ] Unit tests for auth utils and lib functions (Vitest)
- [ ] Integration test for login + saved items flow
- [ ] E2E smoke: login → create saved item → logout (Playwright)

---

## Backlog

- [ ] PWA / offline support
- [ ] Mobile app (Expo)
- [ ] Public profile pages
- [ ] Collaboration on saved items
