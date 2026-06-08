import { OpenAPIHono } from "@hono/zod-openapi";
import { handle } from "hono/vercel";
import type { AuthType } from "@/lib/auth";
import { errorHandler } from "@/server/handlers/error.handler";
import { loggerMiddleware } from "@/server/middleware/logger.middleware";
import auth from "@/server/routes/auth/auth.route";
import docs from "@/server/routes/docs/docs.route";
import health from "@/server/routes/health/health.route";
import users from "@/server/routes/users/users.route";

const app = new OpenAPIHono<{ Variables: AuthType }>({ strict: false }).basePath("/api");

app.use("*", loggerMiddleware);
app.use("*", async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store");
});
app.onError(errorHandler);

app.route("/auth", auth);
app.route("/docs", docs);
app.route("/health", health);
app.route("/users", users);

if (process.env.NODE_ENV === "development") {
  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "Rugby API",
      version: "0.1.0",
      description: "REST API documentation for Rugby application",
      contact: { name: "API Support" },
      license: { name: "MIT", url: "https://opensource.org/licenses/MIT" },
    },
    servers: [{ url: "/api", description: "API Base URL" }],
  });
}

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
