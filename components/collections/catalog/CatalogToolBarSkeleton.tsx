import { Skeleton } from "@/components/ui/skeleton"

export function CatalogToolBarSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3 lg:flex-row">
      <Skeleton className="h-8 w-full lg:w-64" />
      <Skeleton className="h-8 min-w-0 flex-1" />
      <Skeleton className="h-8 w-full lg:w-48" />
    </div>
  )
}
