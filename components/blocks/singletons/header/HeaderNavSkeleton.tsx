import { SearchBarSkeleton } from "@/components/shared/search/SearchBarSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export function HeaderNavSkeleton() {
  return (
    <header
      aria-hidden="true"
      className="fixed top-0 z-50 w-full border-b border-transparent"
    >
      <div className="mx-auto flex h-24 w-full items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <SearchBarSkeleton />
          <Skeleton className="h-10 w-14" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </header>
  )
}
