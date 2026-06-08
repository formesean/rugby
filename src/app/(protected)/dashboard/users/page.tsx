import { count, eq, ne } from "drizzle-orm";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { user } from "@/db/schema";
import type { UserTab } from "@/lib/users/queries";
import { getUsers } from "@/lib/users/queries";
import { UsersTabs } from "./_components/users-tabs";

type SearchParams = Promise<{ tab?: string; page?: string; search?: string }>;

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const { tab: rawTab, page: rawPage, search: rawSearch } = await searchParams;

  const tab: UserTab = rawTab === "admins" ? "admins" : "users";
  const page = Math.max(1, Number(rawPage) || 1);
  const search = rawSearch ?? "";

  const [data, [{ adminCount }], [{ userCount }]] = await Promise.all([
    getUsers({ tab, page, search }),
    db.select({ adminCount: count() }).from(user).where(eq(user.role, "admin")),
    db.select({ userCount: count() }).from(user).where(ne(user.role, "admin")),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10 flex flex-col gap-6 md:gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage user roles across your application.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <UsersTabs
          tab={tab}
          page={page}
          search={search}
          data={data}
          adminCount={adminCount}
          userCount={userCount}
        />
      </Suspense>
    </div>
  );
}
