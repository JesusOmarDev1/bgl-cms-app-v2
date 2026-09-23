import { SearchBarSkeleton } from "@/components/shared/search/SearchBarSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export function HeaderNavSkeleton() {
  return (
    <header
      aria-hidden="true"
      className="fixed top-0 z-50 w-full border-b border-transparent"
    >
      <div className="mx-auto flex h-24 w-full flex-nowrap items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="hidden items-center gap-2.5 lg:flex">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SearchBarSkeleton />
          <Skeleton className="hidden size-10 lg:flex" />
          <Skeleton className="hidden h-10 w-28 rounded-full lg:flex" />
          <Skeleton className="size-10 lg:hidden" />
        </div>
      </div>
    </header>
  )
}
