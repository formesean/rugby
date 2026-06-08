import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AuthFormSkeleton({
  fields = 2,
  hasFooter = false,
  className,
}: {
  fields?: number;
  hasFooter?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 md:min-h-[560px]">
          {/* Form side — mirrors p-6 py-8 md:p-8, flex flex-col justify-center */}
          <div className="flex flex-col justify-center p-6 py-8 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Header: logo + h1 + subtitle */}
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="size-9 rounded-sm" />
                <Skeleton className="h-8 w-44 rounded-md" />
                <Skeleton className="h-4 w-56 rounded-md" />
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-5">
                {Array.from({ length: fields }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                ))}
                {/* Submit button */}
                <Skeleton className="h-9 w-full rounded-md" />
              </div>

              {/* Bottom link */}
              <Skeleton className="mx-auto h-4 w-48 rounded-md" />
            </div>
          </div>

          {/* Image side */}
          <div className="relative hidden bg-muted md:block" />
        </CardContent>
      </Card>

      {/* Terms footer */}
      {hasFooter && <Skeleton className="mx-auto h-4 w-72 rounded-md" />}
    </div>
  );
}
