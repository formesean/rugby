"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";
import { timeAgo } from "@/lib/date";

type Session = {
  id: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
};

function isMobile(ua: string | null | undefined) {
  if (!ua) return false;
  return /mobile|android|iphone|ipad/i.test(ua);
}

function parseBrowser(ua: string | null | undefined) {
  if (!ua) return "Unknown device";
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/edge/i.test(ua)) return "Edge";
  if (/opr|opera/i.test(ua)) return "Opera";
  return "Unknown browser";
}

export function SessionsSection({ currentToken }: { currentToken: string }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    authClient.listSessions().then(({ data }) => {
      setSessions((data ?? []) as Session[]);
      setLoading(false);
    });
  }, []);

  async function revokeSession(token: string) {
    setRevoking(token);
    await authClient.revokeSession({ token });
    setSessions((prev) => prev.filter((s) => s.token !== token));
    setRevoking(null);
  }

  async function revokeOtherSessions() {
    setSubmitting(true);
    await authClient.revokeOtherSessions();
    setSessions((prev) => prev.filter((s) => s.token === currentToken));
    setConfirmRevokeAll(false);
    setSubmitting(false);
  }

  const otherSessions = sessions.filter((s) => s.token !== currentToken);
  const currentSession = sessions.find((s) => s.token === currentToken);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Active Sessions</CardTitle>
            <CardDescription className="mt-1">
              Devices currently signed in to your account.
            </CardDescription>
          </div>
          {otherSessions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={() => setConfirmRevokeAll(true)}
            >
              Sign out all others
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="size-8 rounded-md shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No active sessions found.</p>
          ) : (
            <>
              {/* Current session first */}
              {currentSession && (
                <SessionRow
                  session={currentSession}
                  isCurrent
                  revoking={false}
                  onRevoke={() => {}}
                />
              )}
              {otherSessions.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  isCurrent={false}
                  revoking={revoking === s.token}
                  onRevoke={() => revokeSession(s.token)}
                />
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={confirmRevokeAll}
        onOpenChange={(v) => {
          if (!v) setConfirmRevokeAll(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out all other sessions?</DialogTitle>
            <DialogDescription>
              All devices except this one will be signed out immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRevokeAll(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={revokeOtherSessions} disabled={submitting}>
              {submitting ? "Signing out…" : "Sign out all others"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SessionRow({
  session,
  isCurrent,
  revoking,
  onRevoke,
}: {
  session: Session;
  isCurrent: boolean;
  revoking: boolean;
  onRevoke: () => void;
}) {
  const mobile = isMobile(session.userAgent);
  const Icon = mobile ? Smartphone : Monitor;
  const browser = parseBrowser(session.userAgent);

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{browser}</span>
          {isCurrent && (
            <span className="text-xs rounded-full bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 font-medium shrink-0">
              Current
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {session.ipAddress ? `${session.ipAddress} · ` : ""}Last active{" "}
          {timeAgo(session.updatedAt)}
        </span>
      </div>
      {!isCurrent && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 h-7 text-xs"
          disabled={revoking}
          onClick={onRevoke}
        >
          {revoking ? "Signing out…" : "Sign out"}
        </Button>
      )}
    </div>
  );
}
