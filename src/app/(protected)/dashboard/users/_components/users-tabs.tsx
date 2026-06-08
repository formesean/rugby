"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GetUsersResult, UserTab } from "@/lib/users/queries";
import { AddAdminButton } from "./add-admin-button";
import { Pagination, SearchInput } from "./users-controls";
import { UsersTable } from "./users-table";

type Props = {
  tab: UserTab;
  page: number;
  search: string;
  data: GetUsersResult;
  adminCount: number;
  userCount: number;
};

export function UsersTabs({ tab, page, search, data, adminCount, userCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    params.delete("page");
    params.delete("search");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs on the left */}
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            Users
            <Badge variant="secondary" className="text-xs tabular-nums">
              {userCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="admins" className="gap-1.5">
            Admins
            <Badge variant="secondary" className="text-xs tabular-nums">
              {adminCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Search on the right (users), with Add Admin to its right (admins) */}
        <div className="flex items-center gap-2 sm:justify-end">
          <SearchInput value={search} className="sm:w-72" />
          {tab === "admins" && <AddAdminButton />}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <TabsContent value={tab} className="mt-0">
            <div className="overflow-x-auto">
              <div className="min-w-[320px] p-4">
                <UsersTable rows={data.rows} />
              </div>
            </div>
            <div className="px-4 pb-4">
              <Pagination page={page} pageCount={data.pageCount} total={data.total} />
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
