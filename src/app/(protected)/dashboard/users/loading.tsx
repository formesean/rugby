import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function TableRowSkeleton() {
  return (
    <tr>
      <td className="py-3 px-3">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </td>
      <td className="py-3 px-3 hidden sm:table-cell">
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="py-3 px-3 text-right">
        {/* Mirrors the size-7 MoreHorizontal icon button */}
        <Skeleton className="size-7 ml-auto rounded-md" />
      </td>
    </tr>
  );
}

export default function UsersLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10 flex flex-col gap-6 md:gap-8">
      {/* Header — mirrors <div> with h1 + p mt-1 */}
      <div>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-64 mt-1" />
      </div>

      {/* Toolbar — mirrors UsersTabs flex flex-col gap-3 mb-3 */}
      <div className="flex flex-col gap-3 mb-3">
        {/* Row 1: tabs + (no add admin button on skeleton since tab=users by default) */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
        {/* Row 2: search full-width */}
        <Skeleton className="h-9 w-full rounded-md" />
      </div>

      {/* Card — mirrors CardContent p-0 > overflow-x-auto > min-w-[320px] p-4 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[320px] p-4">
              <table className="w-full text-sm">
                <colgroup>
                  <col className="w-auto" />
                  <col className="hidden sm:table-column w-36" />
                  <col className="w-16" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 px-3 text-left">
                      <Skeleton className="h-3 w-10" />
                    </th>
                    <th className="pb-2 px-3 text-left hidden sm:table-cell">
                      <Skeleton className="h-3 w-12" />
                    </th>
                    <th className="pb-2 px-3 text-right">
                      <Skeleton className="h-3 w-14 ml-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination — mirrors px-4 pb-4 div outside scroll area */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between border-t border-border pt-4 mt-1">
              <Skeleton className="h-3 w-32" />
              <div className="flex gap-1">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
