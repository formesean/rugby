import { OpenAPIHono } from "@hono/zod-openapi";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: { api: {} } }));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/lib/sentry", () => ({ captureException: vi.fn() }));
vi.mock("@/server/services/logger.service", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/server/middleware/logger.middleware", () => ({
  loggerMiddleware: async (_c: unknown, next: () => Promise<void>) => next(),
}));

function stubRouter() {
  const r = new OpenAPIHono();
  r.get("/", (c) => c.json({ ok: true }));
  return { default: r };
}
vi.mock("@/server/routes/auth/auth.route", () => stubRouter());
vi.mock("@/server/routes/docs/docs.route", () => stubRouter());
vi.mock("@/server/routes/health/health.route", () => stubRouter());
vi.mock("@/server/routes/users/users.route", () => stubRouter());

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

async function loadApp(nodeEnv: string) {
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.resetModules();
  return import("@/app/api/[[...routes]]/route");
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.stubEnv("NODE_ENV", ORIGINAL_NODE_ENV ?? "test");
  vi.unstubAllEnvs();
});

describe("API catch-all", () => {
  it("sets Cache-Control: no-store on every /api response", async () => {
    const { GET } = await loadApp("production");
    const res = await GET(new Request("http://localhost/api/health"));
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("serves the OpenAPI spec in development", async () => {
    const { GET } = await loadApp("development");
    const res = await GET(new Request("http://localhost/api/openapi.json"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.openapi).toBe("3.0.0");
    expect(body.info.title).toBe("Rugby API");
  });

  it("does not expose the OpenAPI spec in production", async () => {
    const { GET } = await loadApp("production");
    const res = await GET(new Request("http://localhost/api/openapi.json"));
    expect(res.status).toBe(404);
  });

  it("does not expose the OpenAPI spec in test", async () => {
    const { GET } = await loadApp("test");
    const res = await GET(new Request("http://localhost/api/openapi.json"));
    expect(res.status).toBe(404);
  });
});
