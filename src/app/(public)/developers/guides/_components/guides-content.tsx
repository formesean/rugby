"use client";

import { type Easing, motion } from "framer-motion";
import {
  Activity,
  Database,
  GitBranch,
  Globe,
  KeyRound,
  Lock,
  RefreshCw,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";
import Link from "next/link";

const EASE_OUT: Easing = [0.0, 0.0, 0.2, 1.0];

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: EASE_OUT },
  }),
};

const QUICK_START = [
  "pnpm install",
  "cp .env.example .env",
  "docker compose up -d",
  "pnpm db:migrate",
  "pnpm dev",
];

const ENV_VARS = [
  { key: "DATABASE_URL", value: "postgresql://postgres:postgres@localhost:5432/rugby" },
  { key: "BETTER_AUTH_SECRET", value: "openssl rand -base64 32" },
  { key: "BASE_URL", value: "http://localhost:3000" },
  { key: "NEXT_PUBLIC_BASE_URL", value: "http://localhost:3000" },
];

const DB_COMMANDS = [
  { cmd: "pnpm db:generate", desc: "generate migration from schema" },
  { cmd: "pnpm db:migrate", desc: "apply migrations" },
  { cmd: "pnpm db:studio", desc: "open drizzle studio GUI" },
];

const GUIDES = [
  {
    tag: "api",
    title: "Adding API Routes",
    icon: Zap,
    body: "Create a Hono route module under src/server/routes/, then mount it in the catch-all handler. OpenAPI docs are generated automatically at /api/docs (development only).",
    steps: [
      "Create src/server/routes/[feature]/[feature].route.ts",
      "Mount with app.route('/feature', router) in src/app/api/[[...routes]]/route.ts",
    ],
    code: `import { OpenAPIHono } from '@hono/zod-openapi'
import type { AuthType } from '@/lib/auth'
import { authMiddleware } from '@/server/middleware/auth.middleware'

const router = new OpenAPIHono<{ Variables: AuthType }>({ strict: false })

router.get('/', authMiddleware, async (c) => {
  return c.json({ data: [] })
})

export default router`,
  },
  {
    tag: "db",
    title: "Adding Database Tables",
    icon: Database,
    body: "Add tables to src/db/schema/, export from the index barrel, then generate and apply the migration. Query with the Drizzle db singleton.",
    steps: [
      "Create src/db/schema/[table].ts",
      "Export from src/db/schema/index.ts",
      "Run pnpm db:generate then pnpm db:migrate",
    ],
    code: `import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  authorId: text('author_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})`,
  },
  {
    tag: "auth",
    title: "Page Protection",
    icon: Lock,
    body: "proxy.ts gates /dashboard and /account at the edge via cookie check. The protected layout does a real server-side session check and redirects if no session exists.",
    steps: [
      "Place the page under src/app/(protected)/",
      "The layout handles redirect — no extra code needed per page",
      "Add an admin check in the layout for role-gated sections",
    ],
    code: `// src/app/(protected)/dashboard/projects/page.tsx
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProjectsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  return <div>Projects</div>
}`,
  },
  {
    tag: "session",
    title: "Reading Sessions",
    icon: KeyRound,
    body: "Better Auth is configured in src/lib/auth/. Read the session server-side in layouts and pages, or client-side in components via the auth client hook.",
    steps: [
      "Server: import auth from @/lib/auth/auth",
      "Client: import authClient from @/lib/auth/client",
    ],
    code: `// Server Component
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'

const session = await auth.api.getSession({ headers: await headers() })

// Client Component
'use client'
import { authClient } from '@/lib/auth/client'

const { data: session, isPending } = authClient.useSession()`,
  },
  {
    tag: "env",
    title: "Environment Variables",
    icon: Terminal,
    body: "All env vars are validated at startup via @t3-oss/env-nextjs + Zod. Add to src/env/server.ts or client.ts — never import from process.env directly.",
    steps: [
      "Add Zod schema entry to src/env/server.ts or src/env/client.ts",
      "Add the var to .env.example",
    ],
    code: `// src/env/server.ts
export const env = createEnv({
  server: {
    MY_SECRET: z.string().min(1),
  },
  // ...
})

// Usage — never use process.env directly
import { env } from '@/env/server'
const secret = env.MY_SECRET`,
  },
  {
    tag: "middleware",
    title: "Edge Middleware",
    icon: Globe,
    body: "proxy.ts (not middleware.ts) runs at the edge on every request. It cookie-gates protected routes and injects x-pathname so server components can read the current path.",
    steps: [
      "Edit src/proxy.ts to add new protected path prefixes",
      "Read the path server-side via reqHeaders.get('x-pathname')",
    ],
    code: `// src/proxy.ts — add a new protected prefix
const PROTECTED = ['/dashboard', '/account', '/admin']

// Reading path in a Server Component
import { headers } from 'next/headers'
const reqHeaders = await headers()
const pathname = reqHeaders.get('x-pathname') ?? ''`,
  },
  {
    tag: "test",
    title: "Testing",
    icon: Shield,
    body: "Vitest with happy-dom. Tests mirror src/ under src/__tests__/. next/navigation is pre-mocked in vitest.setup.ts. For Hono handlers, assert via vi.fn() call args.",
    steps: [
      "Mirror the file path: src/lib/foo.ts → src/__tests__/lib/foo.test.ts",
      "Run pnpm test:ci for a single pass, pnpm test for watch mode",
    ],
    code: `import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
})`,
  },
  {
    tag: "query",
    title: "Server State (TanStack Query)",
    icon: RefreshCw,
    body: "All server state — API data and mutations — lives in TanStack Query. QueryProvider is already wired up; create hooks under src/hooks/ and always throw on non-ok responses.",
    steps: [
      "Create src/hooks/use-[feature].ts with useQuery / useMutation",
      "Call onSuccess to invalidateQueries after mutations",
      "Set staleTime explicitly — omitting it defaults to 0 (refetch every mount)",
    ],
    code: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: (): Promise<{ posts: Post[] }> =>
      fetch('/api/posts').then((r) => {
        if (!r.ok) throw new Error('Failed to fetch posts')
        return r.json()
      }),
    staleTime: 30_000,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string }) =>
      fetch('/api/posts', { method: 'POST', body: JSON.stringify(data) })
        .then((r) => { if (!r.ok) throw new Error('Failed'); return r.json() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}`,
  },
  {
    tag: "store",
    title: "Client UI State (Zustand)",
    icon: Lock,
    body: "Zustand manages ephemeral client-side UI state only — open/close dialogs, selected rows, filters. Never put server state in a store; use TanStack Query for that.",
    steps: [
      "Create src/stores/[feature].store.ts",
      "Use in any 'use client' component — no Provider needed",
      "Select slices to avoid unnecessary re-renders",
    ],
    code: `import { create } from 'zustand'

type FeatureStore = {
  isOpen: boolean
  selectedId: string | null
  open: (id: string) => void
  close: () => void
}

export const useFeatureStore = create<FeatureStore>((set) => ({
  isOpen: false,
  selectedId: null,
  open: (id) => set({ isOpen: true, selectedId: id }),
  close: () => set({ isOpen: false, selectedId: null }),
}))

// In a component — select a slice to avoid extra renders
const { isOpen, close } = useFeatureStore()
const open = useFeatureStore((s) => s.open)`,
  },
  {
    tag: "monitoring",
    title: "Error Tracking (Sentry)",
    icon: Activity,
    body: "Sentry is wired into the build and runtime but stays inert until NEXT_PUBLIC_SENTRY_DSN is set. Source maps upload during build when SENTRY_AUTH_TOKEN, SENTRY_ORG, and SENTRY_PROJECT are present. Auth and cookie headers are stripped before events are sent.",
    steps: [
      "Set NEXT_PUBLIC_SENTRY_DSN in .env to enable capture",
      "Add SENTRY_AUTH_TOKEN / SENTRY_ORG / SENTRY_PROJECT for source maps",
      "Capture manually with captureException from @/lib/sentry",
    ],
    code: `// Automatic: server, edge, client, and React render errors
// are captured once NEXT_PUBLIC_SENTRY_DSN is set.

// Manual capture anywhere
import { captureException, setUser } from '@/lib/sentry'

try {
  await riskyOperation()
} catch (err) {
  captureException(err as Error, { feature: 'checkout' })
}

// Associate events with a user after auth
setUser({ id: user.id, email: user.email })`,
  },
  {
    tag: "ci",
    title: "CI / CD",
    icon: GitBranch,
    body: "GitHub Actions runs lint, typecheck, tests, and build on every push. Vercel deploys main to production and develop to preview via the native GitHub integration.",
    steps: [
      "CI config: .github/workflows/ci.yml",
      "Vercel skips non-main/develop branches via ignoreCommand in vercel.json",
    ],
    code: `# .github/workflows/ci.yml runs:
pnpm check          # biome lint + format
pnpm typecheck      # tsc --noEmit
pnpm test:coverage  # vitest + coverage gate
pnpm build          # next build`,
  },
];

export function GuidesContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="grid grid-cols-12 gap-4 items-start">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="col-span-2 hidden md:flex items-start justify-end pt-2"
          >
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground select-none [writing-mode:vertical-rl] rotate-180">
              dev guides
            </span>
          </motion.div>

          <div className="col-span-12 md:col-span-10">
            <motion.p
              custom={0}
              initial="hidden"
              animate="show"
              variants={fade}
              className="font-mono mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
            >
              developer · guides · reference
            </motion.p>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="show"
              variants={fade}
              className="text-[clamp(2.6rem,6vw,5rem)] font-bold leading-[1.05] tracking-tight text-foreground"
            >
              Build on top.
              <br />
              <span className="text-muted-foreground">Not from scratch.</span>
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="show"
              variants={fade}
              className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground"
            >
              Everything you need to extend the template — routes, tables, auth, middleware, and CI.
              Full architecture docs in{" "}
              <code className="font-mono text-sm text-foreground">AGENTS.md</code>.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── Quick Start ──────────────────────────── */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid grid-cols-12 gap-4 items-start">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="col-span-2 hidden md:flex items-start justify-end pt-1"
            >
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground select-none [writing-mode:vertical-rl] rotate-180">
                quick start
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="col-span-12 md:col-span-4"
            >
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em] mb-6">
                $ getting-started.sh
              </p>
              <div className="divide-y divide-border border border-border">
                {QUICK_START.map((cmd, i) => (
                  <div key={cmd} className="flex items-center gap-4 px-4 py-3">
                    <span className="font-mono text-[10px] text-border select-none w-4 shrink-0 text-right">
                      {i + 1}
                    </span>
                    <code className="font-mono text-sm text-foreground">{cmd}</code>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="col-span-12 md:col-span-6 md:pl-8 flex flex-col gap-5 mt-8 md:mt-0"
            >
              <div>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em] mb-4">
                  $ cat .env.example
                </p>
                <div className="border border-border divide-y divide-border">
                  {ENV_VARS.map(({ key, value }) => (
                    <div key={key} className="grid grid-cols-2 gap-4 px-4 py-2.5">
                      <code className="font-mono text-xs text-foreground">{key}</code>
                      <code className="font-mono text-xs text-muted-foreground truncate">
                        {value}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em] mb-4">
                  $ pnpm db --help
                </p>
                <div className="border border-border divide-y divide-border">
                  {DB_COMMANDS.map(({ cmd, desc }) => (
                    <div key={cmd} className="flex items-center justify-between px-4 py-2.5">
                      <code className="font-mono text-xs text-foreground">{cmd}</code>
                      <span className="font-mono text-xs text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Guides ───────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-12">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em]">
              $ ls guides/
            </span>
          </div>

          <div className="flex flex-col gap-px border border-border bg-border">
            {GUIDES.map((guide, i) => (
              <motion.div
                key={guide.tag}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={fade}
                className="bg-background"
              >
                <div className="grid grid-cols-12 gap-0">
                  {/* Left: meta */}
                  <div className="col-span-12 md:col-span-4 p-6 flex flex-col gap-3 border-b md:border-b-0 md:border-r border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <guide.icon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">{guide.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground border border-border px-1.5 py-0.5">
                        {guide.tag}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-muted-foreground">{guide.body}</p>

                    <div className="flex flex-col gap-1 mt-auto">
                      {guide.steps.map((step, si) => (
                        <div key={si} className="flex items-start gap-2">
                          <span className="font-mono text-[10px] text-border shrink-0 mt-0.5">
                            {si + 1}.
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: code */}
                  <div className="col-span-12 md:col-span-8 bg-muted/30">
                    <pre className="p-6 overflow-x-auto">
                      <code className="font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre">
                        {guide.code}
                      </code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">rugby/v0.1.0</span>
          <div className="flex gap-4">
            <Link
              href="/legal/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              terms
            </Link>
            <Link
              href="/legal/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
