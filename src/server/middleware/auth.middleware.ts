import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { type AuthType, auth } from "@/lib/auth";

/**
 * Hono middleware that checks for authentication
 * Attaches user and session to context variables
 */
export const authMiddleware = createMiddleware<{ Variables: AuthType }>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
});

/**
 * Optional auth middleware - doesn't throw if not authenticated
 * Just attaches user/session if available
 */
export const optionalAuthMiddleware = createMiddleware<{ Variables: AuthType }>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);

  await next();
});
