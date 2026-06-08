import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AuthType } from "@/lib/auth";
import { auth } from "@/lib/auth";

const router = new OpenAPIHono<{ Bindings: AuthType }>({ strict: false });

const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.email(),
    name: z.string(),
    image: z.string().nullable().optional(),
    emailVerified: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  }),
  session: z.object({
    id: z.string(),
    token: z.string(),
    expiresAt: z.iso.datetime(),
  }),
});

const ErrorSchema = z.object({
  error: z.string(),
  status: z.number().int(),
  details: z.array(z.string()).optional(),
});

// Register auth paths in the OpenAPI spec without attaching handlers
// (better-auth owns actual request handling via the catch-all below)
router.openAPIRegistry.registerPath(
  createRoute({
    method: "post",
    path: "/sign-up/email",
    tags: ["Auth"],
    summary: "Sign up with email",
    description: "Create a new user account with email and password",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z.email(),
              password: z.string().min(8),
              name: z.string(),
            }),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "User created successfully",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
      400: {
        description: "Invalid input",
        content: { "application/json": { schema: ErrorSchema } },
      },
    },
  }),
);

router.openAPIRegistry.registerPath(
  createRoute({
    method: "post",
    path: "/sign-in/email",
    tags: ["Auth"],
    summary: "Sign in with email",
    description: "Authenticate a user with email and password",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z.email(),
              password: z.string(),
            }),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "Authentication successful",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
      401: {
        description: "Invalid credentials",
        content: { "application/json": { schema: ErrorSchema } },
      },
    },
  }),
);

router.openAPIRegistry.registerPath(
  createRoute({
    method: "post",
    path: "/sign-out",
    tags: ["Auth"],
    summary: "Sign out",
    description: "Sign out the current user and invalidate the session",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Successfully signed out",
        content: {
          "application/json": {
            schema: z.object({ success: z.boolean() }),
          },
        },
      },
    },
  }),
);

router.openAPIRegistry.registerPath(
  createRoute({
    method: "get",
    path: "/session",
    tags: ["Auth"],
    summary: "Get current session",
    description: "Returns the current user session if authenticated",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Session found",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: ErrorSchema } },
      },
    },
  }),
);

router.on(["POST", "GET"], "/*", (c) => auth.handler(c.req.raw));

export default router;
