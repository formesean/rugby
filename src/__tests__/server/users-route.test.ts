import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      setRole: vi.fn(),
      adminUpdateUser: vi.fn(),
      removeUser: vi.fn(),
    },
  },
}));

vi.mock("@/db", () => ({ db: { select: vi.fn(), insert: vi.fn() } }));
vi.mock("@/db/schema", () => ({ user: { id: "id", email: "email" } }));
vi.mock("drizzle-orm", () => ({ eq: vi.fn() }));
vi.mock("@/lib/sentry", () => ({ captureException: vi.fn() }));
vi.mock("@/server/services/logger.service", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

async function getAuth() {
  const { auth } = await import("@/lib/auth");
  return auth;
}

async function buildApp(callerRole: string | null) {
  const auth = await getAuth();

  // Seed getSession for authMiddleware
  vi.mocked(auth.api.getSession).mockResolvedValue(
    callerRole === null
      ? null
      : ({ user: { id: "caller", role: callerRole }, session: { id: "s1" } } as never),
  );

  const { errorHandler } = await import("@/server/handlers/error.handler");
  const usersRoute = (await import("@/server/routes/users/users.route")).default;
  const app = new Hono().route("/users", usersRoute);
  app.onError(errorHandler);
  return app;
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe("PATCH /users/:id/role", () => {
  it("returns 401 when unauthenticated", async () => {
    const app = await buildApp(null);
    const res = await app.request("/users/u1/role", {
      method: "PATCH",
      body: JSON.stringify({ role: "admin" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 when caller is not admin", async () => {
    const app = await buildApp("user");
    const res = await app.request("/users/u1/role", {
      method: "PATCH",
      body: JSON.stringify({ role: "admin" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(403);
  });

  it("returns 403 when admin targets their own account", async () => {
    const app = await buildApp("admin");
    const res = await app.request("/users/caller/role", {
      method: "PATCH",
      body: JSON.stringify({ role: "user" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(403);
  });

  it("calls setRole and returns success when caller is admin", async () => {
    const app = await buildApp("admin");
    const auth = await getAuth();
    vi.mocked(auth.api.setRole).mockResolvedValueOnce(undefined as never);

    const res = await app.request("/users/u1/role", {
      method: "PATCH",
      body: JSON.stringify({ role: "user" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(auth.api.setRole).toHaveBeenCalledWith(
      expect.objectContaining({ body: { userId: "u1", role: "user" } }),
    );
  });

  it("returns 400 via the shared error envelope for an invalid role", async () => {
    const app = await buildApp("admin");
    const res = await app.request("/users/u1/role", {
      method: "PATCH",
      body: JSON.stringify({ role: "superuser" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
    expect(body.status).toBe(400);
    expect(Array.isArray(body.details)).toBe(true);
  });
});

describe("DELETE /users/:id", () => {
  it("returns 403 when caller is not admin", async () => {
    const app = await buildApp("user");
    const res = await app.request("/users/u1", { method: "DELETE" });
    expect(res.status).toBe(403);
  });

  it("returns 403 when admin targets their own account", async () => {
    const app = await buildApp("admin");
    const res = await app.request("/users/caller", { method: "DELETE" });
    expect(res.status).toBe(403);
  });

  it("calls removeUser and returns success when caller is admin", async () => {
    const app = await buildApp("admin");
    const auth = await getAuth();
    vi.mocked(auth.api.removeUser).mockResolvedValueOnce(undefined as never);

    const res = await app.request("/users/u1", { method: "DELETE" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(auth.api.removeUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { userId: "u1" } }),
    );
  });
});
