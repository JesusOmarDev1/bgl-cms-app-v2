import { Box } from "@/components/shared/content/Box"
import { Skeleton } from "@/components/ui/skeleton"

export function CtaSkeleton() {
  return (
    <Box
      aria-hidden="true"
      className="rounded-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <Skeleton className="h-[37.5px] w-4/5" />
      <Skeleton className="h-6 w-2/3" />
      <div className="flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4 lg:mt-14 xl:mt-16 xl:gap-6">
        <Skeleton className="h-9 w-40" />
      </div>
    </Box>
  )
}
