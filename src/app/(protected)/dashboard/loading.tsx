import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-4 rounded-sm" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function TopUserRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <div className="flex flex-col min-w-0 flex-1 gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-3 w-10 shrink-0" />
    </div>
  );
}

function EventRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 min-w-0">
      <Skeleton className="size-4 shrink-0 rounded-sm" />
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex flex-col items-end shrink-0 gap-0.5 pl-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}

export function AuthEventsCardSkeleton() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4">
        <div className="flex flex-col divide-y divide-border">
          {Array.from({ length: 10 }).map((_, i) => (
            <EventRowSkeleton key={i} />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4 mt-1">
          <Skeleton className="h-3 w-32" />
          <div className="flex gap-1">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10 flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-52 mt-1" />
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart + Top active users */}
      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 min-w-0">
          <CardHeader>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <Skeleton className="h-[180px] sm:h-[220px] w-full rounded-lg" />
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <TopUserRowSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent auth events */}
      <AuthEventsCardSkeleton />
    </div>
  );
}
