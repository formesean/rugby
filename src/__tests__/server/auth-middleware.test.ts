import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import type { AuthType } from "@/lib/auth";
import { authMiddleware, optionalAuthMiddleware } from "@/server/middleware/auth.middleware";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

async function getAuth() {
  const { auth } = await import("@/lib/auth");
  return auth;
}

function makeApp(middleware: typeof authMiddleware) {
  const app = new Hono<{ Variables: AuthType }>();
  app.use("*", middleware);
  app.get("/test", (c) => c.json({ user: c.get("user"), session: c.get("session") }));
  return app;
}

describe("authMiddleware", () => {
  it("throws 401 when no session", async () => {
    const auth = await getAuth();
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const app = makeApp(authMiddleware);
    const res = await app.request("/test");
    expect(res.status).toBe(401);
  });

  it("attaches user and session to context when authenticated", async () => {
    const auth = await getAuth();
    const fakeSession = {
      user: { id: "u1", email: "test@example.com", role: "user" },
      session: { id: "s1", token: "tok" },
    };
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(fakeSession as never);

    const app = makeApp(authMiddleware);
    const res = await app.request("/test");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.id).toBe("u1");
    expect(body.session.id).toBe("s1");
  });
});

describe("optionalAuthMiddleware", () => {
  it("continues with null user/session when no session exists", async () => {
    const auth = await getAuth();
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const app = makeApp(optionalAuthMiddleware as typeof authMiddleware);
    const res = await app.request("/test");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toBeNull();
    expect(body.session).toBeNull();
  });

  it("attaches user and session when session exists", async () => {
    const auth = await getAuth();
    const fakeSession = {
      user: { id: "u2", email: "other@example.com" },
      session: { id: "s2" },
    };
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(fakeSession as never);

    const app = makeApp(optionalAuthMiddleware as typeof authMiddleware);
    const res = await app.request("/test");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.id).toBe("u2");
  });
});
