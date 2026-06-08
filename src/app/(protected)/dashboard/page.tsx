import { Activity, UserPlus, Users, Wifi } from "lucide-react";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { getDashboardStats, getRecentEvents } from "@/lib/dashboard/queries";
import { timeAgo } from "@/lib/date";
import { ActivityChart } from "./_components/activity-chart";
import { AuthEventsCard } from "./_components/auth-events-card";
import { AuthEventsCardSkeleton } from "./loading";

type SearchParams = Promise<{ eventsPage?: string }>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const { eventsPage: rawEventsPage } = await searchParams;
  const eventsPage = Math.max(1, Number(rawEventsPage) || 1);

  const [session, stats, eventsData] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getDashboardStats(),
    getRecentEvents(eventsPage),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10 flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back, {session?.user.name}.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">+{stats.newUsersToday} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online Now</CardTitle>
            <Wifi className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.onlineUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">active in last 15 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Sessions
            </CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.activeSessions}</p>
            <p className="text-xs text-muted-foreground mt-1">unexpired sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Sign-ups
            </CardTitle>
            <UserPlus className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.newUsersToday}</p>
            <p className="text-xs text-muted-foreground mt-1">today</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Top active users */}
      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2 min-w-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Daily Sign-ins — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ActivityChart
              data={stats.dailyActiveUsers.map((d) => ({ date: d.date, users: Number(d.users) }))}
            />
          </CardContent>
        </Card>

        {/* Top 5 active users */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Active Users</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {stats.topActiveUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active sessions.</p>
            ) : (
              stats.topActiveUsers.map((u) => (
                <div key={u.userId} className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{u.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{u.email}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                    {timeAgo(u.lastSeen)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent auth events */}
      <Suspense fallback={<AuthEventsCardSkeleton />}>
        <AuthEventsCard
          events={eventsData.events}
          page={eventsPage}
          pageCount={eventsData.pageCount}
          total={eventsData.total}
        />
      </Suspense>
    </div>
  );
}
