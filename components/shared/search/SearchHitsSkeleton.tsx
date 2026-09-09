import { Skeleton } from "@/components/ui/skeleton"

export function SearchHitsSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-1" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-md px-2 py-2"
        >
          <Skeleton className="size-20 shrink-0 rounded-md" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
