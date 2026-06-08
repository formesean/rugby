import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { captureException } from "@/lib/sentry";
import { logger } from "@/server/services/logger.service";

export function errorHandler(err: Error, c: Context) {
  const method = c.req.method;
  const path = c.req.path;

  if (err instanceof HTTPException) {
    logger.warn({ method, path, status: err.status, err }, err.message);

    if (err.status >= 500) {
      captureException(err, { method, path, status: err.status });
    }

    return c.json({ error: err.message, status: err.status }, err.status);
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => {
      const issuePath = issue.path.length > 0 ? issue.path.join(".") : "root";
      return `${issuePath}: ${issue.message}`;
    });
    logger.warn({ method, path, status: 400, details }, "Validation failed");
    return c.json({ error: "Validation failed", details, status: 400 }, 400);
  }

  logger.error({ method, path, status: 500, err }, "Internal server error");
  captureException(err, { method, path, status: 500 });

  return c.json({ error: "Internal server error", status: 500 }, 500);
}
