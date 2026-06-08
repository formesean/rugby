# AGENTS.md

## About This Template

**rugby** is a production-ready Next.js starter template with type-safe API routes (Hono), cookie-based authentication (Better Auth), and PostgreSQL (Drizzle ORM). Start building your application with auth, email, and a full database layer already wired up.

**What's included:**
- Better Auth with email/password, admin plugin, rate limiting, email verification, and password reset
- Hono-based API routes with OpenAPI documentation at `/api/docs`
- Edge middleware (`proxy.ts`) for cookie-based route protection
- Drizzle ORM with PostgreSQL and a global singleton pool
- Shadcn UI with Tailwind CSS v4 and dark mode via `next-themes`
- TanStack Query for client-side data fetching and cache invalidation
- Zustand for client-side UI state management
- Sentry error tracking (server, edge, client, React render errors) — inert until `NEXT_PUBLIC_SENTRY_DSN` is set
- Security headers: CSP with per-request nonce + `strict-dynamic` (`proxy.ts`), HSTS/nosniff/referrer/permissions (`next.config.ts`)
- Biome for formatting and linting, Husky git hooks, Conventional Commits
- Vitest test suite with happy-dom, CI workflow via GitHub Actions, and a coverage gate on the security-critical core

**Perfect for:** Web applications, internal tools, or any project requiring solid auth, email, and a type-safe database layer without the setup overhead.

## Development Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Build for production
pnpm start            # Production server

# Code Quality
pnpm check            # Biome format + lint + import sort (run before committing)
pnpm lint:fix         # Biome lint with auto-fix
pnpm typecheck        # TypeScript strict check (tsc --noEmit)

# Testing
pnpm test             # Vitest in watch mode
pnpm test:ci          # Vitest single run (used in CI)
pnpm test:coverage    # Vitest with v8 coverage report

# Database
pnpm db:generate      # Generate migration from schema changes
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Drizzle Studio GUI

# Git
pnpm commit           # Interactive conventional commit (Commitizen)
```

## Git Hooks

- **pre-commit**: lint-staged (Biome check on staged files)
- **commit-msg**: Commitlint (validates Conventional Commits format)

## Agent Skills

Reference guides for key libraries used in this project. Read the relevant guide before writing code in that area.

| Topic | Guide |
|-------|-------|
| shadcn/ui — components, forms, icons, styling | [`.agents/skills/shadcn/SKILL.md`](.agents/skills/shadcn/SKILL.md) |
| shadcn/ui — CLI commands and flags | [`.agents/skills/shadcn/cli.md`](.agents/skills/shadcn/cli.md) |
| shadcn/ui — theming and customization | [`.agents/skills/shadcn/customization.md`](.agents/skills/shadcn/customization.md) |
| Better Auth — auth config, sessions, RBAC | [`.agents/skills/better-auth/SKILL.md`](.agents/skills/better-auth/SKILL.md) |
| React + Next.js performance (Vercel) | [`.agents/skills/vercel-react-best-practices/SKILL.md`](.agents/skills/vercel-react-best-practices/SKILL.md) |
| Web interface / accessibility guidelines | [`.agents/skills/web-design-guidelines/SKILL.md`](.agents/skills/web-design-guidelines/SKILL.md) |

## Next.js Agent Rules

<!-- BEGIN:nextjs-agent-rules -->

> This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Architecture

### Request Flow

Every HTTP request hits Next.js. `src/proxy.ts` (the Next.js middleware file — named `proxy.ts`, not `middleware.ts`) runs at the edge and enforces cookie-based auth gates for `/dashboard` and `/account`, redirecting unauthenticated users to `/login`. It also injects `x-pathname` into request headers so server components can read the current path without accessing the URL directly.

The cookie check (`rugby.session_token`) is not authoritative — it is a fast gate only. Real authorization always happens server-side in page/layout components or Hono middleware.

The app has two route groups: `(public)` (landing page, auth forms, legal pages) and `(protected)` (dashboard, account). The protected layout at `src/app/(protected)/layout.tsx` does a server-side session check and redirects if no session exists. The dashboard layout adds an additional admin role check.

### API Routes

All API routes live under `src/app/api/[[...routes]]/route.ts` — a single Hono catch-all that mounts sub-routers for `/auth`, `/health`, `/docs`, and `/users`. Both the Scalar UI (`/api/docs`) and the raw OpenAPI spec (`/api/openapi.json`) are served **in development only** — they are 404 in production so the API surface is never published. Every `/api/*` response also carries `Cache-Control: no-store`.

**Adding a new route:**

1. Create a route module in `src/server/routes/[feature]/[feature].route.ts`:
```typescript
import { OpenAPIHono } from '@hono/zod-openapi'
import type { AuthType } from '@/lib/auth'
import { authMiddleware } from '@/server/middleware/auth.middleware'

const router = new OpenAPIHono<{ Variables: AuthType }>({ strict: false })

router.get('/', authMiddleware, async (c) => {
  return c.json({ data: [] })
})

export default router
```

2. Mount in `src/app/api/[[...routes]]/route.ts`:
```typescript
import featureRoutes from '@/server/routes/feature/feature.route'

app.route('/feature', featureRoutes)
```

**Validation + docs in one place.** Prefer `router.openapi(createRoute(...), handler)` over `registerPath` + a separate handler — it registers the OpenAPI path *and* validates the request, so the schema can't drift from the handler. Read validated input via `c.req.valid("query" | "param" | "json")`; always pass an explicit status to `c.json(body, 200)`. See `src/server/routes/users/users.route.ts`.

**Error model.** Errors are cross-cutting, not per-route. Handlers `throw new HTTPException(status, { message })` (or let a thrown `ZodError` propagate) and the central `errorHandler` (`src/server/handlers/error.handler.ts`) renders the single envelope `{ error, status, details? }`. Each `OpenAPIHono` router sets a `defaultHook` that re-throws validation failures into that same handler, so a bad body returns `{ error: "Validation failed", status: 400, details: [...] }`. Because errors are returned by the shared handler rather than each route, route `responses` declare only the success shape.

**CORS.** The template is same-origin (frontend + API in one Next app) and ships **no CORS** by design. If you split the frontend onto another origin, add `hono/cors` in the catch-all with an explicit allowlist — never `origin: "*"` on credentialed routes.

### Auth

Better Auth is configured in `src/lib/auth/auth.ts` (server) and `src/lib/auth/client.ts` (client). The server config uses the Drizzle adapter and includes:
- `admin` plugin
- Database-backed rate limiting
- Email verification via Resend
- Password reset via Resend
- Auth event logging (`sign-in`, `sign-up`, `sign-out`) to the `auth_event` table via before/after hooks

**Session reads in Server Components:**
```typescript
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'

const session = await auth.api.getSession({ headers: await headers() })
if (!session?.user) redirect('/login')
```

**Session reads in Client Components:**
```typescript
'use client'
import { authClient } from '@/lib/auth/client'

const { data: session, isPending } = authClient.useSession()
```

**Auth Middleware** (`src/server/middleware/auth.middleware.ts`):
- `authMiddleware` — validates the session, attaches `user` and `session` to context variables, throws 401 if unauthenticated. Use on any Hono route that requires authentication.
- `optionalAuthMiddleware` — same but never throws; attaches `null` if no session. Use for routes that serve both guests and authenticated users.

### Database

Drizzle ORM with `pg` connection pool. The pool uses a global singleton pattern to survive Next.js hot reloads in dev, with conservative limits (`max` via `DATABASE_POOL_MAX`, default 5) and SSL enabled automatically for non-local hosts. On serverless platforms, point `DATABASE_URL` at a connection pooler (PgBouncer / Supabase pooler / Neon) — each function instance opens its own pool.

- Import `db` from `@/db`
- Import schema tables from `@/db/schema`
- All new tables go in `src/db/schema/`, exported from `src/db/schema/index.ts`
- After any schema change: `pnpm db:generate` then `pnpm db:migrate`

**Adding a new table:**

1. Create schema in `src/db/schema/[table-name].ts`:
```typescript
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  authorId: text('author_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

2. Export from `src/db/schema/index.ts`:
```typescript
export { posts } from './posts'
```

3. Generate and apply migration:
```bash
pnpm db:generate
pnpm db:migrate
```

### Environment Variables

Two env files: `src/env/server.ts` and `src/env/client.ts`, both using `@t3-oss/env-nextjs` with Zod. Always import env vars from these modules — never from `process.env` directly.

Adding a new env var requires:
1. Adding the Zod schema entry to `src/env/server.ts` or `src/env/client.ts`
2. Adding the var to `.env.example`

```typescript
// Server-side
import { env } from '@/env/server'
const secret = env.BETTER_AUTH_SECRET

// Client-side
import { env } from '@/env/client'
const baseUrl = env.NEXT_PUBLIC_BASE_URL
```

### Styling and Components

Tailwind CSS v4. Shadcn UI components in `src/components/ui/`. Use `cn()` from `@/lib/utils` for conditional classes. Dark mode is class-based via `next-themes`.

- Never use hardcoded color values — always use design system tokens (`text-foreground`, `bg-muted`, etc.)
- Only install Shadcn components via `pnpm dlx shadcn@latest add [component]`

### Testing

Vitest with happy-dom. Tests live in `src/__tests__/` mirroring the `src/` structure. The setup file (`vitest.setup.ts`) mocks `next/navigation` and sets dummy env vars.

For Hono handler tests, assert via `vi.fn()` call args on the mocked `c.json` — do not cast return types.

```bash
# Run a single test file
pnpm test:ci src/__tests__/lib/utils.test.ts
```

`pnpm test:coverage` enforces an 80% threshold, but `coverage.include` in `vitest.config.ts` scopes the gate to the security-critical core (utils, auth middleware, error handler, users route) rather than the whole app. When you add critical logic, extend that `include` list so the gate covers it.

### Observability

Sentry is wired across all runtimes but stays inert until `NEXT_PUBLIC_SENTRY_DSN` is set:

- `src/instrumentation.ts` — loads `sentry.server.config.ts` / `sentry.edge.config.ts` and exports `onRequestError` (captures Server Component, middleware, and route errors).
- `src/instrumentation-client.ts` — client init with session replay and `onRouterTransitionStart`.
- `src/app/error.tsx` and `src/app/global-error.tsx` — report React render errors.
- `next.config.ts` is wrapped with `withSentryConfig`; source maps upload at build time only when `SENTRY_AUTH_TOKEN` (+ `SENTRY_ORG`/`SENTRY_PROJECT`) are present.
- Use the helpers from `@/lib/sentry` (`captureException`, `captureMessage`, `setUser`) for manual capture. The Hono error handler already reports 5xx errors. Auth and cookie headers are stripped before events are sent.

### CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs lint + typecheck, tests with a coverage gate (`pnpm test:coverage`), and build on every push/PR to `main` or `develop`. Vercel deploys via the native GitHub App integration. `vercel.json` uses `ignoreCommand` to skip deployments for any branch other than `main` (production) and `develop` (preview).

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rugby
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-long
BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

`BASE_URL` (server) and `NEXT_PUBLIC_BASE_URL` (client) must always hold the same public origin. Optional vars (`RESEND_*`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_*`, `DATABASE_POOL_MAX`) are documented in `.env.example`.

Generate `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Code Style

### General
- No `any` types — Biome enforces `noExplicitAny`
- No CommonJS (`noCommonJs`) — ESM only
- Double quotes for strings, 2-space indent
- Comments only for non-obvious logic — explain **why**, not **what**

### Components
- Default to React Server Components; add `"use client"` only when needed
- Use `Readonly<Props>` for component prop types
- Use `cn()` for all conditional class merging

## Key Patterns

### New Protected Page

```typescript
// src/app/(protected)/dashboard/projects/page.tsx
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProjectsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  return <div>Projects</div>
}
```

### New API Endpoint (with auth)

```typescript
// src/server/routes/projects/projects.route.ts
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import type { AuthType } from "@/lib/auth";
import { authMiddleware } from "@/server/middleware/auth.middleware";
import { db } from "@/db";

const router = new OpenAPIHono<{ Variables: AuthType }>({ strict: false });

// Register GET /projects in OpenAPI docs
router.openAPIRegistry.registerPath(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Projects"],
    summary: "List projects",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Project list",
        content: { "application/json": { schema: z.object({ projects: z.array(z.object({ id: z.string(), name: z.string() })) }) } },
      },
    },
  }),
);

router.get("/", authMiddleware, async (c) => {
  const projects = await db.query.projects.findMany();
  return c.json({ projects });
});

// For validated POST bodies use router.openapi() — it handles both docs + validation
const createProjectRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Projects"],
  summary: "Create project",
  security: [{ bearerAuth: [] }],
  request: {
    body: { required: true, content: { "application/json": { schema: z.object({ name: z.string().min(1) }) } } },
  },
  responses: {
    201: { description: "Created", content: { "application/json": { schema: z.object({ project: z.object({ name: z.string() }) }) } } },
  },
});

router.openapi(createProjectRoute, async (c) => {
  const { name } = c.req.valid("json");
  // insert...
  return c.json({ project: { name } }, 201);
});

export default router;
```

### Zustand Store

**Rule:** client-side UI state only (open/close dialogs, selected rows, ephemeral filters). Never put server state here — that belongs in TanStack Query.

**Adding a store:**

1. Create `src/stores/[feature].store.ts`:

```typescript
import { create } from "zustand";

type FeatureStore = {
  isOpen: boolean;
  selectedId: string | null;
  open: (id: string) => void;
  close: () => void;
};

export const useFeatureStore = create<FeatureStore>((set) => ({
  isOpen: false,
  selectedId: null,
  open: (id) => set({ isOpen: true, selectedId: id }),
  close: () => set({ isOpen: false, selectedId: null }),
}));
```

2. Use in any `"use client"` component — no Provider needed:

```typescript
"use client";
import { useFeatureStore } from "@/stores/feature.store";

export function FeatureDialog() {
  const { isOpen, close } = useFeatureStore();
  return <Dialog open={isOpen} onOpenChange={close}>...</Dialog>;
}
```

3. Trigger from anywhere (even a sibling component or table row):

```typescript
"use client";
import { useFeatureStore } from "@/stores/feature.store";

export function FeatureRow({ id }: { id: string }) {
  const open = useFeatureStore((s) => s.open);
  return <button onClick={() => open(id)}>Edit</button>;
}
```

**Selecting a slice** (`useFeatureStore((s) => s.field)`) avoids re-rendering the component when unrelated store fields change.

See `src/stores/users.store.ts` for a real example managing dialog state across `UsersTable`.

### TanStack Query

**Rule:** all server state (API data, mutations) lives here. The `QueryProvider` is already wired up in `src/providers/` — no setup needed.

**Adding a query hook:**

1. Create `src/hooks/use-[feature].ts`:

```typescript
// src/hooks/use-posts.ts
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: (): Promise<{ posts: Post[] }> =>
      fetch("/api/posts").then((r) => {
        if (!r.ok) throw new Error("Failed to fetch posts");
        return r.json();
      }),
    staleTime: 30_000,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string }) =>
      fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to create post");
        return r.json();
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });
}
```

2. Use in a client component:

```typescript
"use client";
import { usePosts, useCreatePost } from "@/hooks/use-posts";

export function PostList() {
  const { data, isPending, isError } = usePosts();
  const { mutate: createPost, isPending: isCreating } = useCreatePost();

  if (isPending) return <Skeleton />;
  if (isError) return <p>Failed to load.</p>;

  return (
    <>
      {data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
      <button onClick={() => createPost({ title: "New post" })} disabled={isCreating}>
        Add
      </button>
    </>
  );
}
```

**Key conventions:**
- Always throw on non-ok responses inside `queryFn`/`mutationFn` so React Query can surface errors correctly.
- `queryKey` arrays must be stable and specific — `["posts"]` for the list, `["posts", id]` for a single item.
- Use `onSuccess` on mutations to invalidate the relevant query and trigger a refetch.
- Keep `staleTime` explicit — omitting it defaults to `0` (refetch on every mount).

See `src/hooks/use-users.ts` for a real example with `useQuery` + multiple `useMutation` hooks.

### New Database Query

```typescript
import { db } from '@/db'
import { posts } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Fetch with relations
const post = await db.query.posts.findFirst({
  where: eq(posts.id, postId),
  with: { author: true },
})

// Insert
await db.insert(posts).values({ id, title, authorId })
```
