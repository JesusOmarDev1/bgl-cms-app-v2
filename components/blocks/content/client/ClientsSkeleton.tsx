import { Skeleton } from "@/components/ui/skeleton"

export function ClientsSkeleton() {
  return (
    <div aria-hidden="true" className="w-full overflow-hidden">
      <div className="mx-auto my-14 flex w-full max-w-7xl justify-center px-4">
        <Skeleton className="h-12 w-1/2" />
      </div>
      <div className="flex justify-center gap-8 px-4">
        <Skeleton className="h-16 w-32" />
        <Skeleton className="h-16 w-32" />
        <Skeleton className="h-16 w-32" />
        <Skeleton className="hidden h-16 w-32 sm:block" />
      </div>
      <div className="h-24" />
    </div>
  )
}
