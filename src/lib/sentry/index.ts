import * as Sentry from "@sentry/nextjs";

export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, unknown>,
) {
  Sentry.captureMessage(message, { level, extra: context });
}

export function setUser(user: { id: string; email?: string; name?: string } | null) {
  Sentry.setUser(user ? { id: user.id, email: user.email, username: user.name } : null);
}

export { Sentry };
