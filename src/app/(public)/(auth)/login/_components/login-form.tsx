"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.email("Enter a valid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
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

export function LoginForm({ className }: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("callbackUrl") ?? "";
  const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  const fadeUp = useFadeUp();

  const [showPassword, setShowPassword] = useState(false);
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
    const { data, error } = await signIn.email(values);
    if (error) {
      setApiError(error.message ?? "Invalid email or password. Please try again.");
      setTimeout(() => errorRef.current?.focus(), 50);
      return;
    }
    const isAdmin = (data?.user as { role?: string } | null)?.role === "admin";
    router.push(isAdmin ? "/dashboard" : callbackUrl);
    router.refresh();
  }

  return (
    <motion.div {...fadeUp()} className={cn("flex flex-col gap-4", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 md:min-h-[560px]">
          {/* Form side */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col justify-center p-6 py-8 md:p-8"
          >
            <div className="flex flex-col gap-10">
              {/* Header */}
              <motion.div
                {...fadeUp(0.05)}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="flex size-9 items-center justify-center rounded-sm bg-foreground text-background text-sm font-bold">
                  R
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-balance">Welcome back</h1>
                <p className="text-sm text-muted-foreground text-balance">
                  Sign in to your account to continue
                </p>
              </motion.div>

              {/* Fields */}
              <div className="flex flex-col gap-5">
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

                <motion.div {...fadeUp(0.15)} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      className="pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p aria-live="polite" className="text-sm text-destructive">
                      {errors.password.message}
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

                <motion.div {...fadeUp(0.2)}>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in…" : "Log in"}
                  </Button>
                </motion.div>
              </div>

              {/* Sign up link */}
              <motion.p {...fadeUp(0.25)} className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  Create one
                </Link>
              </motion.p>
            </div>
          </form>

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

      <p className="px-6 text-center text-sm text-muted-foreground">
        By signing in, you agree to our{" "}
        <a href="/legal/terms" className="underline-offset-2 text-white hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/legal/privacy" className="underline-offset-2 text-white hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </motion.div>
  );
}
