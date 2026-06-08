# rugby

A full-stack Next.js starter template with type-safe API routes (Hono + OpenAPI), cookie-based auth (Better Auth), and PostgreSQL (Drizzle ORM).

## What's Included

- **Hono API** - Type-safe API routes with OpenAPI docs at `/api/docs` (development only)
- **Better Auth** - Email/password auth with admin plugin, rate limiting, email verification, and password reset
- **Drizzle ORM** - Type-safe database with migration tooling and connection pooling
- **Edge Middleware** - Cookie-based auth gating for protected routes via `proxy.ts`
- **Shadcn UI** - Component library with Radix primitives and Tailwind CSS v4
- **TanStack Query** - Server state management with caching, invalidation, and mutations
- **Zustand** - Lightweight client-side UI state (no provider required)
- **Resend** - Email delivery for verification and password reset
- **Sentry** - Error tracking, source maps, and session replay (activates when a DSN is set)
- **Security Headers** - CSP with per-request nonce, HSTS, and sensible defaults via `proxy.ts` + `next.config.ts`
- **Code Quality** - Biome (format + lint), TypeScript strict mode, Husky git hooks, Conventional Commits, CI coverage gate

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| API | Hono + Scalar docs |
| Auth | Better Auth (admin plugin) |
| Database | PostgreSQL + Drizzle ORM |
| UI | Tailwind CSS v4 + Shadcn UI |
| Server State | TanStack Query |
| Client State | Zustand |
| Email | Resend |
| Monitoring | Sentry |
| Validation | Zod + @t3-oss/env-nextjs |
| Testing | Vitest + happy-dom |
| Linting | Biome |
| Package Manager | pnpm |

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database URL and secrets

# Start local Postgres
docker compose up -d

# Apply database migrations
pnpm db:migrate

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rugby
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-long
BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

`BASE_URL` (server) and `NEXT_PUBLIC_BASE_URL` (client) must hold the same public origin. See `.env.example` for optional vars (Resend, Sentry, `DATABASE_POOL_MAX`).

Generate a secure `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Deployment

Optimized for Vercel via the native GitHub integration. On any serverless platform, point `DATABASE_URL` at a connection pooler (PgBouncer, Supabase pooler, or Neon) — each function instance opens its own pool, so a direct Postgres connection will exhaust available connections under load. Keep `DATABASE_POOL_MAX` low (1–5) in serverless environments.

Error tracking via Sentry activates automatically when `NEXT_PUBLIC_SENTRY_DSN` is set; source maps upload during build when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are present.

## Project Structure

```
rugby/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (public)/                 # Public routes (landing, auth, legal, guides)
│   │   ├── (protected)/              # Protected routes (dashboard, account)
│   │   │   └── layout.tsx            # Server-side session check + redirect
│   │   ├── api/[[...routes]]/        # Hono catch-all API handler
│   │   │   └── route.ts              # Mounts /auth, /health, /docs, /users
│   │   ├── error.tsx                 # Route error boundary (reports to Sentry)
│   │   └── global-error.tsx          # Root error boundary (reports to Sentry)
│   │
│   ├── components/
│   │   └── ui/                       # Shadcn UI primitives
│   │
│   ├── db/                            # Database layer
│   │   ├── schema/                   # Drizzle tables (auth, rate-limit)
│   │   └── index.ts                  # Drizzle client (pooled singleton)
│   │
│   ├── env/
│   │   ├── server.ts                 # Server-side env vars (Zod)
│   │   └── client.ts                 # Client-side env vars (Zod)
│   │
│   ├── lib/
│   │   ├── auth/                     # Better Auth server + client instances
│   │   ├── email/                    # Resend integration + templates
│   │   ├── sentry/                   # Sentry helpers (captureException, setUser)
│   │   └── utils.ts                  # cn() and general utilities
│   │
│   ├── server/
│   │   ├── handlers/                 # Central error handler
│   │   ├── middleware/               # Hono auth + logger middleware
│   │   └── routes/                   # Hono route modules (auth, users, health, docs)
│   │
│   ├── instrumentation.ts            # Sentry server/edge init + onRequestError
│   ├── instrumentation-client.ts     # Sentry client init
│   └── proxy.ts                      # Next.js edge middleware (route protection + CSP)
│
├── sentry.server.config.ts           # Sentry Node runtime config
├── sentry.edge.config.ts             # Sentry edge runtime config
├── .husky/                            # Git hooks (pre-commit, commit-msg)
├── .env.example                      # Environment variables template
├── AGENTS.md / CLAUDE.md             # Architecture docs for AI agents
├── docker-compose.yml                # Local Postgres container
├── drizzle.config.ts                 # Drizzle ORM configuration
└── next.config.ts                    # Next.js config (security headers + Sentry)
```

## Available Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Build for production
pnpm start            # Production server

# Code Quality
pnpm check            # Biome format + lint + import sort
pnpm lint:fix         # Biome lint with auto-fix
pnpm typecheck        # TypeScript strict check
pnpm test:ci          # Vitest single run

# Database
pnpm db:generate      # Generate migration from schema changes
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Drizzle Studio GUI

# Git
pnpm commit           # Interactive conventional commit
```

## Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Types:** `feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `build` · `ci` · `chore` · `revert`

**Examples:**
```
feat(auth): add OAuth login support
fix(api): resolve timeout issue in user endpoint
docs: update installation instructions
```

## Customization

See `CLAUDE.md` for detailed architecture documentation and patterns for:

- Adding new API routes (Hono)
- Adding new database tables (Drizzle)
- Extending auth configuration (Better Auth)
- Adding protected pages and role checks
- Environment variable schema (t3-oss/env-nextjs)

## License

MIT
