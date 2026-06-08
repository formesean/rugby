"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchInput({ value, className }: { value: string; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (e.target.value) {
        params.set("search", e.target.value);
      } else {
        params.delete("search");
      }
      params.delete("page");
      startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    },
    [router, pathname, searchParams],
  );

  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        aria-label="Search users"
        name="search"
        autoComplete="off"
        defaultValue={value}
        onChange={handleChange}
        placeholder="Search by name or email…"
        data-pending={isPending ? "" : undefined}
        className="pl-8 w-full transition-opacity data-[pending]:opacity-60"
      />
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  total,
}: {
  page: number;
  pageCount: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.replace(`${pathname}?${params.toString()}`);
  }

  const safePage = page;
  const safePageCount = Math.max(1, pageCount);

  return (
    <div className="flex items-center justify-between border-t border-border pt-4 mt-1">
      <p className="text-xs tabular-nums text-muted-foreground">
        {total === 0
          ? "No results"
          : `${total} result${total === 1 ? "" : "s"} · Page ${safePage} of ${safePageCount}`}
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
  );
}
