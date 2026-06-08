import { headers } from "next/headers";
import { EmailVerificationBanner } from "@/components/email-verification-banner";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth/auth";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function NavbarWrapper() {
  const reqHeaders = await headers();
  const pathname = reqHeaders.get("x-pathname") ?? reqHeaders.get("referer") ?? "";

  if (AUTH_ROUTES.some((r) => pathname.includes(r))) return null;

  const session = await auth.api.getSession({ headers: reqHeaders });
  const role = (session?.user as { role?: string } | undefined)?.role ?? null;
  const emailVerified = session?.user.emailVerified ?? true;

  return (
    <>
      <Navbar role={role} isAuthenticated={!!session} />
      {session && !emailVerified && <EmailVerificationBanner />}
    </>
  );
}
