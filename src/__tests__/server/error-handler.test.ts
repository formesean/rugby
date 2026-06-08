import { HTTPException } from "hono/http-exception";
import { describe, expect, it, vi } from "vitest";
import { type ZodError, z } from "zod";
import { errorHandler } from "@/server/handlers/error.handler";

vi.mock("@/lib/sentry", () => ({ captureException: vi.fn() }));
vi.mock("@/server/services/logger.service", () => ({
  logger: { warn: vi.fn(), error: vi.fn() },
}));

function makeContext(method = "GET", path = "/api/test") {
  const json = vi.fn();
  return {
    req: { method, path },
    json,
  } as unknown as Parameters<typeof errorHandler>[1];
}

describe("errorHandler", () => {
  it("returns the correct status and message for HTTPException", () => {
    const c = makeContext();
    const err = new HTTPException(404, { message: "Not found" });
    errorHandler(err, c);
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Not found", status: 404 }),
      404,
    );
  });

  it("returns 400 with details array for ZodError", () => {
    const c = makeContext("POST", "/api/users");
    const schema = z.object({ email: z.email() });
    let zodErr!: ZodError;
    try {
      schema.parse({ email: "bad" });
    } catch (e) {
      zodErr = e as ZodError;
    }

    errorHandler(zodErr, c);
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Validation failed",
        details: expect.arrayContaining([expect.any(String)]),
        status: 400,
      }),
      400,
    );
  });

  it("returns 500 for generic errors without leaking the message", () => {
    const c = makeContext();
    errorHandler(new Error("Something exploded"), c);
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Internal server error", status: 500 }),
      500,
    );
  });

  it("captures 5xx HTTPExceptions to Sentry but not 4xx", async () => {
    const { captureException } = await import("@/lib/sentry");
    vi.mocked(captureException).mockClear();

    errorHandler(new HTTPException(400, { message: "Bad request" }), makeContext());
    expect(captureException).not.toHaveBeenCalled();

    errorHandler(new HTTPException(500, { message: "Server error" }), makeContext());
    expect(captureException).toHaveBeenCalledTimes(1);
  });
});
