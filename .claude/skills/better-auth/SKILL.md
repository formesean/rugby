---
name: better-auth-rules
description: Guide AI to implement authentication and authorization using Better Auth with Drizzle ORM, Hono.js, and Next.js. Use when asked to "set up auth", "add login", "protect routes", "add roles", "configure Google sign-in", "create middleware/proxy", or any auth-related task.
---

## Project Architecture

This project uses a **split client-server architecture**:
- **Frontend**: Next.js (App Router) — handles UI, auth client, and proxy (middleware)
- **Backend**: Hono.js — hosts the Better Auth handler, API routes, and business logic
- **Database**: Drizzle ORM with PostgreSQL (or MySQL/SQLite — adjust `provider` accordingly)
- **Auth**: Better Auth with email/password, Google OAuth, and admin plugin for RBAC

Better Auth must be installed in **both** the frontend and backend packages.

---

## Environment Variables

Always require these in `.env`:

```env
BETTER_AUTH_SECRET=           # min 32 chars, generate with: openssl rand -base64 32
BETTER_AUTH_URL=              # Base URL of your Hono backend, e.g. http://localhost:8787
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=                 # PostgreSQL connection string
```

Never hardcode secrets. Always use `process.env` with `as string` assertion or `!` non-null.

---

## Server-Side Auth Configuration (Hono Backend)

### Auth Instance — `auth.ts`

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg", // "pg" | "mysql" | "sqlite"
    schema,
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    admin(),  // Adds role field to user, admin endpoints, impersonation, ban/unban
  ],

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});
```

**Key rules:**
- Export the auth instance as `auth` or as a default export — the CLI depends on this.
- Place the file in `lib/auth.ts`, `utils/auth.ts`, or `src/lib/auth.ts`.
- Use `better-auth/minimal` instead of `better-auth` when using Drizzle adapter to reduce bundle size (excludes Kysely).
- Always pass `schema` to drizzleAdapter when you have a custom Drizzle schema.
- Always set `baseURL` to avoid `redirect_uri_mismatch` errors with Google OAuth.

### Hono Server — `server.ts`

```ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { auth } from "./auth";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// CORS — required for cross-origin requests from Next.js frontend
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Auth session middleware — populates c.get("user") and c.get("session")
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

// Mount Better Auth handler — MUST handle both GET and POST
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Example protected route
app.get("/api/me", (c) => {
  const user = c.get("user");
  if (!user) return c.body(null, 401);
  return c.json({ user });
});

serve({ fetch: app.fetch, port: 8787 });
```

**Key rules:**
- Always pass `c.req.raw` (the raw Request) to `auth.handler`, NOT the Hono context.
- CORS `credentials: true` is required for cookie-based auth across origins.
- The session middleware uses `auth.api.getSession({ headers })` — this is the server-side session check.
- Mount auth handler AFTER middleware.

---

## Client-Side Auth (Next.js Frontend)

### Auth Client — `lib/auth-client.ts`

```ts
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL, // Points to Hono backend
  plugins: [
    adminClient(),
  ],
});

// Export convenience methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
```

**Key rules:**
- Import from `better-auth/react` for React/Next.js projects (provides hooks like `useSession`).
- `baseURL` must point to the Hono backend (where Better Auth handler is mounted).
- Use `NEXT_PUBLIC_` prefix for client-accessible env vars in Next.js.
- Always add matching client plugins for every server plugin (e.g., `admin()` → `adminClient()`).

### Next.js Route Handler (Optional Proxy)

If you also want to handle auth on Next.js directly (not typical in split architecture):

```ts
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

### Server Actions with `nextCookies`

When using auth in Next.js server actions, add the `nextCookies` plugin to handle cookie setting:

```ts
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  // ...config
  plugins: [nextCookies()], // MUST be the last plugin in the array
});
```

---

## Next.js Proxy (formerly Middleware) — `proxy.ts`

Next.js 16 renames `middleware.ts` → `proxy.ts` and `middleware()` → `proxy()`. For older versions, use `middleware.ts`.

### Cookie-Based Check (Recommended — fast, optimistic)

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

### Full Session Validation (Next.js 15.2+ / 16+ with Node.js runtime)

```ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

**Key rules:**
- `getSessionCookie()` only checks cookie existence — it does NOT validate the session. This is for optimistic redirects only.
- If you customized the cookie name/prefix in auth.ts, pass matching config to `getSessionCookie()`.
- Always validate sessions on actual pages/routes/server actions, never rely solely on proxy.
- Proxy/middleware is NOT for authorization — it's for optimistic UX redirects.
- For migration: rename `middleware.ts` → `proxy.ts`, rename `middleware` → `proxy` function.

---

## Drizzle ORM Integration

### Schema Generation

After configuring auth with plugins, generate the Drizzle schema:

```bash
npx @better-auth/cli@latest generate --output ./db/schema.ts
```

Or apply migrations directly (Kysely adapter only):

```bash
npx @better-auth/cli@latest migrate
```

For Drizzle, use `generate` then apply with Drizzle Kit:

```bash
npx drizzle-kit push
# or
npx drizzle-kit migrate
```

### Drizzle Adapter Config

```ts
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

database: drizzleAdapter(db, {
  provider: "pg",   // "pg" | "mysql" | "sqlite"
  schema,           // Pass your Drizzle schema for type safety
})
```

**Key rules:**
- Always re-run `generate` after adding/removing plugins — each plugin may add tables or columns.
- If table names differ (e.g., `users` instead of `user`), map them: `schema: { ...schema, user: schema.users }` or use `user: { modelName: "users" }`.
- For plural table names across the board, use `usePlural: true` in adapter options.
- Enable experimental joins for 2-3x performance improvement:
  ```ts
  experimental: { joins: true }
  ```
- Use `better-auth/minimal` import to exclude Kysely when using Drizzle adapter.

### Core Schema (auto-generated, but know the structure)

Better Auth requires these core tables: `user`, `session`, `account`, `verification`.
The admin plugin adds a `role` column (string, default `"user"`) and `banned`, `banReason`, `banExpires` columns to the `user` table.

---

## Authentication Patterns

### Email & Password

**Sign Up:**
```ts
await authClient.signUp.email({
  email: "user@example.com",
  password: "securepassword",
  name: "John Doe",
});
```

**Sign In:**
```ts
await authClient.signIn.email({
  email: "user@example.com",
  password: "securepassword",
  callbackURL: "/dashboard",
});
```

**Server-Side Sign In:**
```ts
const session = await auth.api.signInEmail({
  body: { email: "user@example.com", password: "securepassword" },
});
```

### Google OAuth

**Redirect URL setup in Google Cloud Console:**
- Development: `http://localhost:8787/api/auth/callback/google`
- Production: `https://your-api-domain.com/api/auth/callback/google`
- The redirect URL follows the pattern: `{BETTER_AUTH_URL}/api/auth/callback/google`

**Sign In:**
```ts
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
  errorCallbackURL: "/sign-in?error=true",
});
```

**Sign In with ID Token (no redirect):**
```ts
await authClient.signIn.social({
  provider: "google",
  idToken: {
    token: googleIdToken,
    accessToken: googleAccessToken,
  },
});
```

**Force account selection:**
```ts
socialProviders: {
  google: {
    prompt: "select_account",
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  },
}
```

**Always get refresh token:**
```ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    accessType: "offline",
    prompt: "select_account consent",
  },
}
```

### Sign Out

```ts
await authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
      router.push("/sign-in");
    },
  },
});
```

---

## Session Management

### Client-Side (React)

```tsx
"use client";
import { useSession } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending, error } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return <div>Welcome, {session.user.name}</div>;
}
```

### Server-Side (Next.js Server Components / Route Handlers)

```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});
```

### Server-Side (Hono)

```ts
app.get("/api/protected", (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ data: "protected content" });
});
```

### Cookie Cache (Performance)

Enable session cookie caching to reduce database calls:

```ts
session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // 5 min cache
  },
},
```

---

## Role-Based Access Control (Admin Plugin)

### Define Permissions — `auth/permissions.ts`

```ts
import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  project: ["create", "read", "update", "delete"],
  user: ["read", "ban", "impersonate"],
  settings: ["read", "update"],
} as const; // MUST use `as const` for TypeScript inference

const ac = createAccessControl(statement);

export const userRole = ac.newRole({
  project: ["read"],
  settings: ["read"],
});

export const adminRole = ac.newRole({
  project: ["create", "read", "update", "delete"],
  user: ["read", "ban"],
  settings: ["read", "update"],
});

export const superAdminRole = ac.newRole({
  project: ["create", "read", "update", "delete"],
  user: ["read", "ban", "impersonate"],
  settings: ["read", "update"],
});

export { ac };
```

### Server Config with RBAC

```ts
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, userRole, adminRole, superAdminRole } from "./auth/permissions";

export const auth = betterAuth({
  // ...other config
  plugins: [
    adminPlugin({
      ac,
      roles: {
        user: userRole,
        admin: adminRole,
        superAdmin: superAdminRole,
      },
      defaultRole: "user",
      adminUserIds: ["admin-user-id-here"], // Optional: hardcoded admin IDs
    }),
  ],
});
```

### Client Config with RBAC

```ts
import { adminClient } from "better-auth/client/plugins";
import { ac, userRole, adminRole, superAdminRole } from "@/auth/permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        user: userRole,
        admin: adminRole,
        superAdmin: superAdminRole,
      },
    }),
  ],
});
```

### Admin Operations

```ts
// Set user role (requires admin)
await authClient.admin.setRole({
  userId: "target-user-id",
  role: "admin", // or ["admin", "editor"] for multiple roles
});

// Ban a user
await authClient.admin.banUser({
  userId: "target-user-id",
  banReason: "Violated terms of service",
  banExpiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
});

// Unban a user
await authClient.admin.unbanUser({ userId: "target-user-id" });

// Impersonate a user
await authClient.admin.impersonateUser({ userId: "target-user-id" });

// Stop impersonating
await authClient.admin.stopImpersonating();

// List users (with pagination/filter)
const { data: users } = await authClient.admin.listUsers({
  query: { limit: 10, offset: 0 },
});

// Check permissions
const { data } = await authClient.admin.hasPermission({
  userId: "user-id",
  permission: {
    project: ["create", "update"],
  },
});
```

### Server-Side Permission Check

```ts
const hasAccess = await auth.api.hasPermission({
  headers: c.req.raw.headers,
  body: {
    permission: {
      project: ["delete"],
    },
  },
});
```

**Key rules:**
- When creating custom roles that override built-in roles (like `admin`), import and merge `defaultStatements` to preserve default permissions.
- The `role` field on the user table is a string. For multiple roles, it stores a JSON array string.
- `adminUserIds` bypasses all permission checks — use sparingly.
- Always validate permissions server-side. Client-side checks are for UX only.

---

## Plugin System Rules

1. Server plugins go in `auth.ts` → `plugins: [...]`
2. Client plugins go in `auth-client.ts` → `plugins: [...]`
3. Every server plugin with client functionality needs its matching client plugin.
4. After adding any plugin, run `npx @better-auth/cli@latest generate` to update schema.
5. Then run `npx drizzle-kit push` or `npx drizzle-kit migrate` to apply.

Common plugin pairs:
| Server Import | Client Import |
|---|---|
| `admin()` from `better-auth/plugins` | `adminClient()` from `better-auth/client/plugins` |
| `twoFactor()` from `better-auth/plugins` | `twoFactorClient()` from `better-auth/client/plugins` |
| `organization()` from `better-auth/plugins` | `organizationClient()` from `better-auth/client/plugins` |

---

## CLI Commands

```bash
# Generate Drizzle schema from auth config + plugins
npx @better-auth/cli@latest generate

# Migrate database directly (Kysely adapter only)
npx @better-auth/cli@latest migrate

# Initialize Better Auth in project
npx @better-auth/cli@latest init

# Generate secret key
npx @better-auth/cli@latest secret
```

---

## TypeScript & Type Safety

### Infer Session Types

```ts
// From the auth instance
type Session = typeof auth.$Infer.Session;
type User = typeof auth.$Infer.Session.user;
type SessionData = typeof auth.$Infer.Session.session;
```

### Hono Context Typing

```ts
const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();
```

### Client Type Inference for Custom Session

```ts
import { customSessionClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

const authClient = createAuthClient({
  plugins: [customSessionClient<typeof auth>()],
});
```

---

## Error Handling

Better Auth uses `APIError` for server-side errors:

```ts
import { APIError } from "better-auth/api";

throw new APIError("BAD_REQUEST", {
  message: "Custom error message",
});
```

Client-side errors follow `{ data, error }` pattern:

```ts
const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "wrong",
});

if (error) {
  console.error(error.message); // "Invalid credentials"
  console.error(error.status);  // 401
}
```

---

## Common Mistakes to Avoid

1. **Don't pass Hono context to auth.handler** — always use `c.req.raw` (the raw Request object).
2. **Don't forget CORS with `credentials: true`** when frontend and backend are on different origins.
3. **Don't rely on proxy/middleware for authorization** — it's for optimistic redirects only. Always validate sessions in pages/routes.
4. **Don't skip schema generation** after adding plugins — you'll get runtime errors for missing tables/columns.
5. **Don't use `express.json()` before the Better Auth handler** — it interferes with body parsing.
6. **Don't forget `baseURL`** — Google OAuth will fail with `redirect_uri_mismatch` without it.
7. **Don't use `as const` without it on access control statements** — TypeScript inference breaks without it.
8. **Don't put `nextCookies()` anywhere but last** in the plugins array.
9. **Don't confuse `getSessionCookie` (cookie existence check) with `auth.api.getSession` (full validation)**.
10. **Don't forget to pass matching `ac` and `roles` to BOTH server and client plugins** for RBAC.

---

## File Structure Reference

```
project/
├── apps/
│   ├── web/                     # Next.js frontend
│   │   ├── lib/
│   │   │   └── auth-client.ts   # createAuthClient with plugins
│   │   ├── auth/
│   │   │   └── permissions.ts   # Access control definitions (shared)
│   │   ├── proxy.ts             # Next.js proxy (was middleware.ts)
│   │   └── app/
│   │       ├── api/auth/[...all]/route.ts  # Optional: local auth handler
│   │       ├── sign-in/page.tsx
│   │       ├── sign-up/page.tsx
│   │       └── dashboard/page.tsx
│   └── api/                     # Hono.js backend
│       ├── lib/
│       │   └── auth.ts          # betterAuth instance with plugins
│       ├── db/
│       │   ├── index.ts         # Drizzle db instance
│       │   └── schema.ts        # Generated + custom Drizzle schema
│       └── server.ts            # Hono app with auth handler
├── packages/
│   └── shared/                  # Shared types/permissions (optional)
└── .env
```

---

## References

- Better Auth Docs: https://www.better-auth.com/docs
- Better Auth LLMs.txt: https://better-auth.com/llms.txt
- Drizzle Adapter: https://www.better-auth.com/docs/adapters/drizzle
- Hono Integration: https://www.better-auth.com/docs/integrations/hono
- Next.js Integration: https://www.better-auth.com/docs/integrations/next
- Admin Plugin: https://www.better-auth.com/docs/plugins/admin
- Google Provider: https://www.better-auth.com/docs/authentication/google
- Session Management: https://www.better-auth.com/docs/concepts/session-management