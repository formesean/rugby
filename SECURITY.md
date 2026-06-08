# Security Policy

## Supported Versions

This is a starter template. Security fixes are applied to the `main` branch only. Pin to a commit or fork the repository for long-term stability.

## Reporting a Vulnerability

Please report security vulnerabilities privately using GitHub's [private vulnerability reporting](https://github.com/formesean/rugby/security/advisories/new). Do not open public issues for security reports.

When reporting, include:

- A description of the vulnerability and its impact
- Steps to reproduce
- Affected files or routes, if known

You can expect an initial response within 7 days.

## Security Defaults in This Template

- **Auth** — Better Auth with HTTP-only cookies, database-backed rate limiting, email verification, and password reset.
- **Authorization** — The `proxy.ts` cookie check is a non-authoritative fast gate; real checks run server-side in layouts and Hono middleware (`authMiddleware`, admin role checks).
- **Headers** — CSP with per-request nonce + `strict-dynamic`, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- **API** — Same-origin only (no CORS); the OpenAPI docs UI and spec (`/api/docs`, `/api/openapi.json`) are disabled in production, and every `/api/*` response sends `Cache-Control: no-store`.
- **Secrets** — `.env` is git-ignored; env vars are validated at startup via `@t3-oss/env-nextjs`.
- **Observability** — Sentry strips `authorization` and `cookie` headers before sending events.

When extending the template, run the included checks before committing: `pnpm check`, `pnpm typecheck`, and `pnpm test:coverage`.
