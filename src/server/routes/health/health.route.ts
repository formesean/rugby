import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { sql } from "drizzle-orm";
import { db } from "@/db";

const router = new OpenAPIHono();

const startTime = Date.now();

const HealthSchema = z.object({
  status: z.string().openapi({ example: "ok" }),
  database: z.string().openapi({ example: "ok" }),
  timestamp: z.iso.datetime(),
  uptime: z.number().openapi({ description: "Server uptime in seconds" }),
});

const healthRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Health"],
  summary: "Health check",
  description: "Returns the health status of the API and its database connection",
  responses: {
    200: {
      description: "API is healthy",
      content: { "application/json": { schema: HealthSchema } },
    },
    503: {
      description: "API is unhealthy (database unreachable)",
      content: { "application/json": { schema: HealthSchema } },
    },
  },
});

router.openapi(healthRoute, async (c) => {
  let healthy = true;
  try {
    await db.execute(sql`select 1`);
  } catch {
    healthy = false;
  }

  const body = {
    status: healthy ? "ok" : "error",
    database: healthy ? "ok" : "error",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  return c.json(body, healthy ? 200 : 503);
});

export default router;
