"use client";

import { type Easing, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Database,
  GitBranch,
  Globe,
  KeyRound,
  LayoutDashboard,
  Mail,
  RefreshCw,
  Shield,
  Store,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const EASE_OUT: Easing = [0.0, 0.0, 0.2, 1.0];

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: EASE_OUT },
  }),
};

const STACK = [
  {
    tag: "auth",
    label: "Better Auth",
    detail: "email/password · admin · rate-limit · verify · reset",
    icon: KeyRound,
  },
  { tag: "api", label: "Hono", detail: "type-safe routes · OpenAPI · Edge-ready", icon: Zap },
  {
    tag: "db",
    label: "Drizzle + PostgreSQL",
    detail: "schema-first · migrations · singleton pool",
    icon: Database,
  },
  {
    tag: "ui",
    label: "Shadcn + Tailwind v4",
    detail: "dark mode · next-themes · zero-radius",
    icon: LayoutDashboard,
  },
  {
    tag: "mail",
    label: "Resend",
    detail: "verification · password-reset · html templates",
    icon: Mail,
  },
  {
    tag: "monitoring",
    label: "Sentry",
    detail: "error tracking · source maps · session replay · DSN-gated",
    icon: Activity,
  },
  {
    tag: "edge",
    label: "proxy.ts",
    detail: "cookie-gate · x-pathname · route groups",
    icon: Globe,
  },
  {
    tag: "query",
    label: "TanStack Query",
    detail: "server state · cache · invalidation · mutations",
    icon: RefreshCw,
  },
  {
    tag: "store",
    label: "Zustand",
    detail: "client UI state · no provider · slice selection",
    icon: Store,
  },
  {
    tag: "quality",
    label: "Biome + Husky",
    detail: "format · lint · import-sort · conventional commits",
    icon: GitBranch,
  },
  {
    tag: "ci",
    label: "GitHub Actions + Vitest",
    detail: "lint · typecheck · coverage gate · build",
    icon: Shield,
  },
];

export default function Home() {
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
              starter
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
              next.js · hono · drizzle · better-auth
            </motion.p>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="show"
              variants={fade}
              className="text-[clamp(2.6rem,6vw,5rem)] font-bold leading-[1.05] tracking-tight text-foreground"
            >
              Production-ready.
              <br />
              <span className="text-muted-foreground">Day one.</span>
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="show"
              variants={fade}
              className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground"
            >
              A Next.js starter with auth, email, type-safe API routes, and a PostgreSQL layer wired
              up before you write your first line of business logic.
            </motion.p>

            <motion.div
              custom={3}
              initial="hidden"
              animate="show"
              variants={fade}
              className="mt-8 flex items-center gap-3"
            >
              <Button asChild size="sm">
                <a
                  href="https://github.com/formesean/rugby"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  View on GitHub
                </a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a
                  href="https://github.com/formesean/rugby"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Star on GitHub
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stack ────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-10 flex items-baseline gap-4">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em]">
              $ cat stack.manifest
            </span>
            <span className="text-xs text-border">—</span>
            <span className="text-xs text-muted-foreground">{STACK.length} modules included</span>
          </div>

          <div className="divide-y divide-border">
            {STACK.map((item, i) => (
              <motion.div
                key={item.tag}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={fade}
                className="group grid grid-cols-12 gap-4 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="col-span-2 md:col-span-1 flex items-center">
                  <span className="font-mono text-xs text-muted-foreground">[{item.tag}]</span>
                </div>
                <div className="col-span-5 md:col-span-3 flex items-center gap-3">
                  <item.icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <div className="hidden md:col-span-8 md:flex items-center">
                  <span className="font-mono text-xs text-muted-foreground">{item.detail}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="mt-10 flex items-center"
          >
            <Button asChild variant="outline" size="sm">
              <Link href="/developers/guides" className="flex items-center gap-2">
                Developer Guides
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </motion.div>
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
