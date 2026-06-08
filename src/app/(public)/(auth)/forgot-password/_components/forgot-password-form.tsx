"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.email("Enter a valid email address").min(1, "Email is required"),
});

type FormValues = z.infer<typeof schema>;

function useFadeUp() {
  const reduced = useReducedMotion();
  return (delay = 0) => ({
    initial: { opacity: 0, y: reduced ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0 : 0.22,
      delay: reduced ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  });
}

export function ForgotPasswordForm({ className }: React.ComponentProps<"div">) {
  const fadeUp = useFadeUp();

  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setApiError(null);
    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });
    if (error) {
      setApiError(error.message ?? "Something went wrong. Please try again.");
      setTimeout(() => errorRef.current?.focus(), 50);
      return;
    }
    setSubmittedEmail(values.email);
  }

  return (
    <motion.div {...fadeUp()} className={cn("flex flex-col gap-4", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 md:min-h-[560px]">
          {/* Form side */}
          <div className="flex flex-col justify-center p-6 py-8 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Header */}
              <motion.div
                {...fadeUp(0.05)}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="flex size-9 items-center justify-center rounded-sm bg-foreground text-background text-sm font-bold">
                  R
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-balance">
                  Forgot your password?
                </h1>
                <p className="text-sm text-muted-foreground text-balance">
                  {submittedEmail
                    ? "Check your inbox for a reset link."
                    : "Enter your email and we'll send you a reset link."}
                </p>
              </motion.div>

              {submittedEmail ? (
                <motion.div {...fadeUp(0.1)} className="flex flex-col gap-4">
                  <p className="rounded-md bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
                    If <span className="font-medium text-foreground">{submittedEmail}</span> is
                    registered, you&apos;ll receive an email shortly.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to log in
                  </Link>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                  <motion.div {...fadeUp(0.1)} className="flex flex-col gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      spellCheck={false}
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p aria-live="polite" className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </motion.div>

                  {apiError && (
                    <motion.p
                      ref={errorRef}
                      role="alert"
                      aria-live="polite"
                      tabIndex={-1}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive outline-none"
                    >
                      {apiError}
                    </motion.p>
                  )}

                  <motion.div {...fadeUp(0.15)} className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending…" : "Send reset link"}
                    </Button>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="size-4" aria-hidden="true" />
                      Back to log in
                    </Link>
                  </motion.div>
                </form>
              )}
            </div>
          </div>

          {/* Decorative panel */}
          <div className="relative hidden md:flex items-center justify-center overflow-hidden bg-muted">
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted to-muted-foreground/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--foreground)/0.07)_0%,_transparent_60%)]" />
            <div className="relative flex flex-col items-center gap-3 select-none">
              <div className="flex size-12 items-center justify-center rounded-xl bg-foreground text-background text-lg font-bold shadow-lg">
                R
              </div>
              <p className="text-sm font-medium text-muted-foreground">Your SaaS, ready to ship.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
