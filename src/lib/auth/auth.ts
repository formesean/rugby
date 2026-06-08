import { betterAuth, generateId } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { admin } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { authEvent } from "@/db/schema";
import { env } from "@/env/server";
import { sendEmail } from "@/lib/email";
import { resetPasswordTemplate, verifyEmailTemplate } from "@/lib/email/templates";
import { logger } from "@/server/services/logger.service";

async function logAuthEvent(
  eventType: "sign_in" | "sign_up" | "sign_out",
  opts: { userId?: string; email?: string; ipAddress?: string; userAgent?: string },
) {
  try {
    await db.insert(authEvent).values({
      id: generateId(),
      eventType,
      userId: opts.userId ?? null,
      email: opts.email ?? null,
      ipAddress: opts.ipAddress ?? null,
      userAgent: opts.userAgent ?? null,
    });
  } catch (err) {
    logger.error({ err, eventType }, "Failed to write auth event");
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  basePath: "/api/auth",
  trustedOrigins: [env.BASE_URL],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    useSecureCookies: env.BASE_URL.startsWith("https://"),
    cookiePrefix: "rugby",
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: resetPasswordTemplate(url),
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: verifyEmailTemplate(url),
      });
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/forget-password": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },
  plugins: [admin()],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const ip =
        ctx.request?.headers.get("x-forwarded-for") ??
        ctx.request?.headers.get("x-real-ip") ??
        undefined;
      const ua = ctx.request?.headers.get("user-agent") ?? undefined;

      // Capture session before it's deleted
      if (ctx.path === "/sign-out") {
        const session = await getSessionFromCtx(ctx);
        const userId = session?.user.id;
        const email = session?.user.email;
        await logAuthEvent("sign_out", { userId, email, ipAddress: ip, userAgent: ua });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const session = ctx.context.newSession;
      const ip =
        ctx.request?.headers.get("x-forwarded-for") ??
        ctx.request?.headers.get("x-real-ip") ??
        undefined;
      const ua = ctx.request?.headers.get("user-agent") ?? undefined;

      if (ctx.path === "/sign-in/email" && session) {
        await ctx.context.runInBackgroundOrAwait(
          logAuthEvent("sign_in", {
            userId: session.user.id,
            email: session.user.email,
            ipAddress: ip,
            userAgent: ua,
          }),
        );
      }

      if (ctx.path.startsWith("/sign-up") && session) {
        await ctx.context.runInBackgroundOrAwait(
          logAuthEvent("sign_up", {
            userId: session.user.id,
            email: session.user.email,
            ipAddress: ip,
            userAgent: ua,
          }),
        );
      }
    }),
  },
});

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
