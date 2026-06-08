# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For full architecture documentation, patterns, and code examples, see [AGENTS.md](./AGENTS.md).

## Quick Reference

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm typecheck        # TypeScript type check (tsc --noEmit)
pnpm check            # Biome format + lint + import sort (run before committing)
pnpm lint:fix         # Biome lint with auto-fix
pnpm test             # Vitest in watch mode
pnpm test:ci          # Vitest single run (used in CI)
pnpm test:coverage    # Vitest with v8 coverage report

# Run a single test file
pnpm test:ci src/__tests__/lib/utils.test.ts

# Database
pnpm db:generate      # Generate migration from schema changes
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Open Drizzle Studio

# Setup (one-time, after cloning)
docker compose up -d                              # Start local Postgres
pnpm db:migrate                                   # Apply migrations
node scripts/setup-branch-protection.mjs          # Configure GitHub branch protection
```
