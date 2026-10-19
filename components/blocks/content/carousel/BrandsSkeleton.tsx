import { Skeleton } from "@/components/ui/skeleton"

export function BrandsSkeleton() {
  return (
    <div aria-hidden="true" className="w-full overflow-hidden">
      <div className="mx-auto w-full max-w-7xl">
        <div className="my-14 flex flex-col items-center gap-6 px-4">
          <Skeleton className="h-9 w-1/2 sm:h-10 md:h-12 lg:h-[3.75rem]" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>
      <div className="flex h-24 items-center justify-center px-2">
        <Skeleton className="size-20" />
      </div>
      <div className="relative -mt-5 h-24 w-full lg:-mt-8 lg:h-36" />
    </div>
  )
}
