import { Skeleton } from "@/components/ui/skeleton"

export function MapSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl ring-1 ring-foreground/10"
    >
      <Skeleton className="h-[400px] w-full rounded-none" />
      <div className="flex flex-col items-center gap-2 px-8 py-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  )
}
