"use client";

import { ChevronLeft, ChevronRight, LogIn, LogOut, UserPlus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuthEventRow } from "@/lib/dashboard/queries";
import { timeAgo } from "@/lib/date";

const eventConfig = {
  sign_in: { label: "Signed in", icon: LogIn, color: "text-blue-500" },
  sign_up: { label: "Signed up", icon: UserPlus, color: "text-green-500" },
  sign_out: { label: "Signed out", icon: LogOut, color: "text-muted-foreground" },
} as const;

type Props = {
  events: AuthEventRow[];
  page: number;
  pageCount: number;
  total: number;
};

export function AuthEventsCard({ events, page, pageCount, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("eventsPage", String(next));
    router.replace(`${pathname}?${params.toString()}`);
  }

  const safePage = page;
  const safePageCount = Math.max(1, pageCount);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Auth Events</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events recorded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {events.map((event) => {
              const cfg = eventConfig[event.eventType];
              return (
                <div key={event.id} className="flex items-center gap-3 py-3 min-w-0">
                  <cfg.icon className={`size-4 shrink-0 ${cfg.color}`} aria-hidden="true" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">
                      {event.userName ?? event.email ?? "Unknown user"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{event.email}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-0.5 pl-2">
                    <span className={`text-xs font-medium ${cfg.color} whitespace-nowrap`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {timeAgo(event.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border pt-4 mt-1">
          <p className="text-xs tabular-nums text-muted-foreground">
            {total === 0
              ? "No events"
              : `${total} event${total === 1 ? "" : "s"} · Page ${safePage} of ${safePageCount}`}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={safePage <= 1}
              onClick={() => navigate(safePage - 1)}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={safePage >= pageCount}
              onClick={() => navigate(safePage + 1)}
              aria-label="Go to next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
