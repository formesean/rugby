"use client";

import { ArrowRight, MailWarning, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function EmailVerificationBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="sticky top-14 z-40 flex justify-center px-4 pt-3 pointer-events-none">
      <div className="pointer-events-auto flex items-center rounded-full border border-border bg-background/90 px-5 py-2.5 shadow-md backdrop-blur-sm text-sm w-full max-w-2xl">
        <MailWarning className="size-4 shrink-0 text-muted-foreground mr-3" />
        <span className="text-foreground flex-1">Please verify your email address.</span>
        <Link
          href="/account/profile?verify=1"
          className="flex items-center gap-1 font-medium text-foreground underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm shrink-0 mr-4"
        >
          Verify now
          <ArrowRight className="size-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss verification banner"
          className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
