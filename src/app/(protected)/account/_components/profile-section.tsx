"use client";

import { CheckCircle2, MailCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function ProfileSection({
  name,
  email,
  emailVerified,
}: {
  name: string;
  email: string;
  emailVerified: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldHighlight = searchParams.get("verify") === "1";

  const [displayName, setDisplayName] = useState(name);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState(false);

  const verifyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldHighlight || emailVerified) return;

    const el = verifyRef.current;
    if (!el) return;

    const frame = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlighted(true);
      const t = setTimeout(() => setHighlighted(false), 2000);
      return () => clearTimeout(t);
    });

    return () => cancelAnimationFrame(frame);
  }, [shouldHighlight, emailVerified]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim() || displayName === name) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const { error } = await authClient.updateUser({ name: displayName.trim() });
    if (error) {
      setError(error.message ?? "Failed to update name.");
    } else {
      setSuccess(true);
      router.refresh();
    }
    setSubmitting(false);
  }

  async function handleSendVerification() {
    setSending(true);
    setSendError(null);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/account/profile",
    });
    if (error) {
      setSendError(error.message ?? "Failed to send verification email.");
    } else {
      setSent(true);
    }
    setSending(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setSuccess(false);
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" value={email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600 dark:text-green-400">Name updated.</p>}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !displayName.trim() || displayName === name}
              >
                {submitting ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!emailVerified && (
        <div
          ref={verifyRef}
          id="email-verification"
          className={cn(
            "rounded-xl transition-shadow duration-700",
            highlighted && "ring-2 ring-yellow-400 shadow-[0_0_0_4px_theme(colors.yellow.400/20%)]",
          )}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MailCheck className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Email verification</CardTitle>
              </div>
              <CardDescription>Verify your email address to secure your account.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {sent ? (
                <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="size-4 shrink-0" />
                  Verification email sent — check your inbox.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    A verification link will be sent to{" "}
                    <span className="font-medium text-foreground">{email}</span>.
                  </p>
                  {sendError && <p className="text-sm text-destructive">{sendError}</p>}
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleSendVerification} disabled={sending}>
                      {sending ? "Sending…" : "Send verification email"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {emailVerified && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              <CardTitle className="text-base">Email verified</CardTitle>
            </div>
            <CardDescription>Your email address has been verified.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </>
  );
}
