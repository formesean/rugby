import { Resend } from "resend";
import { env } from "@/env/server";
import { logger } from "@/server/services/logger.service";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export type SendEmailResult = { sent: boolean; skipped?: "not_configured" };

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  if (!resend || !env.RESEND_FROM_EMAIL) {
    const missing = [
      !env.RESEND_API_KEY && "RESEND_API_KEY",
      !env.RESEND_FROM_EMAIL && "RESEND_FROM_EMAIL",
    ].filter(Boolean);
    logger.warn(
      { to, subject, missing },
      "Email skipped: Resend is not configured. Set the missing variables to enable email delivery.",
    );
    return { sent: false, skipped: "not_configured" };
  }

  await resend.emails.send({ from: env.RESEND_FROM_EMAIL, to, subject, html });
  return { sent: true };
}
