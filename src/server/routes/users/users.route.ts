import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { db } from "@/db";
import { user } from "@/db/schema";
import type { AuthType } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { getUsers } from "@/lib/users/queries";
import { authMiddleware } from "@/server/middleware/auth.middleware";

const router = new OpenAPIHono<{ Variables: AuthType }>({
  strict: false,
  defaultHook: (result) => {
    if (!result.success) throw result.error;
  },
});

const RoleSchema = z.object({ role: z.enum(["user", "admin"]) });
const NameSchema = z.object({ name: z.string().min(1) });
const EmailSchema = z.object({ email: z.email() });
const IdParamSchema = z.object({ id: z.string() });
const SuccessSchema = z.object({ success: z.boolean() });
const UsersQuerySchema = z.object({
  tab: z.enum(["users", "admins"]).optional().default("users"),
  page: z.coerce.number().int().min(1).optional().default(1),
  search: z.string().optional().default(""),
});

function assertAdmin(role: string | null | undefined) {
  if (role !== "admin") throw new HTTPException(403, { message: "Forbidden" });
}

router.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Users"],
    summary: "List users",
    description: "Paginated list of users or admins. Admin only.",
    security: [{ bearerAuth: [] }],
    middleware: [authMiddleware] as const,
    request: { query: UsersQuerySchema },
    responses: {
      200: {
        description: "Paginated user list",
        content: {
          "application/json": {
            schema: z.object({
              rows: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                  role: z.string().nullable(),
                  createdAt: z.string(),
                }),
              ),
              total: z.number(),
              pageCount: z.number(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    assertAdmin(c.get("user")?.role);

    const { tab, page, search } = c.req.valid("query");
    const result = await getUsers({ tab, page, search });

    return c.json(
      {
        ...result,
        rows: result.rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      },
      200,
    );
  },
);

router.openapi(
  createRoute({
    method: "patch",
    path: "/{id}/role",
    tags: ["Users"],
    summary: "Set user role",
    description: "Change the role of a user. Admin only.",
    security: [{ bearerAuth: [] }],
    middleware: [authMiddleware] as const,
    request: {
      params: IdParamSchema,
      body: { required: true, content: { "application/json": { schema: RoleSchema } } },
    },
    responses: {
      200: {
        description: "Role updated",
        content: { "application/json": { schema: SuccessSchema } },
      },
    },
  }),
  async (c) => {
    const caller = c.get("user");
    assertAdmin(caller?.role);

    const { id } = c.req.valid("param");
    if (id === caller?.id) throw new HTTPException(403, { message: "Cannot change your own role" });

    const { role } = c.req.valid("json");
    await auth.api.setRole({ body: { userId: id, role }, headers: c.req.raw.headers });
    return c.json({ success: true }, 200);
  },
);

router.openapi(
  createRoute({
    method: "patch",
    path: "/{id}/name",
    tags: ["Users"],
    summary: "Update user name",
    description: "Update the full name of a user. Admin only.",
    security: [{ bearerAuth: [] }],
    middleware: [authMiddleware] as const,
    request: {
      params: IdParamSchema,
      body: { required: true, content: { "application/json": { schema: NameSchema } } },
    },
    responses: {
      200: {
        description: "Name updated",
        content: { "application/json": { schema: SuccessSchema } },
      },
    },
  }),
  async (c) => {
    assertAdmin(c.get("user")?.role);

    const { id } = c.req.valid("param");
    const { name } = c.req.valid("json");
    await auth.api.adminUpdateUser({
      body: { userId: id, data: { name } },
      headers: c.req.raw.headers,
    });
    return c.json({ success: true }, 200);
  },
);

router.openapi(
  createRoute({
    method: "post",
    path: "/promote-by-email",
    tags: ["Users"],
    summary: "Promote user to admin by email",
    description: "Set a user's role to admin by their email address. Admin only.",
    security: [{ bearerAuth: [] }],
    middleware: [authMiddleware] as const,
    request: {
      body: { required: true, content: { "application/json": { schema: EmailSchema } } },
    },
    responses: {
      200: {
        description: "User promoted",
        content: { "application/json": { schema: SuccessSchema } },
      },
    },
  }),
  async (c) => {
    assertAdmin(c.get("user")?.role);

    const { email } = c.req.valid("json");
    const [found] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email.trim().toLowerCase()))
      .limit(1);
    if (!found) throw new HTTPException(404, { message: "No user found with that email address." });

    await auth.api.setRole({
      body: { userId: found.id, role: "admin" },
      headers: c.req.raw.headers,
    });
    return c.json({ success: true }, 200);
  },
);

router.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["Users"],
    summary: "Delete user",
    description: "Permanently delete a user account. Admin only.",
    security: [{ bearerAuth: [] }],
    middleware: [authMiddleware] as const,
    request: { params: IdParamSchema },
    responses: {
      200: {
        description: "User deleted",
        content: { "application/json": { schema: SuccessSchema } },
      },
    },
  }),
  async (c) => {
    const caller = c.get("user");
    assertAdmin(caller?.role);

    const { id } = c.req.valid("param");
    if (id === caller?.id)
      throw new HTTPException(403, { message: "Cannot delete your own account" });

    await auth.api.removeUser({ body: { userId: id }, headers: c.req.raw.headers });
    return c.json({ success: true }, 200);
  },
);

export default router;
