import { Box } from "@/components/shared/content/Box"
import { Skeleton } from "@/components/ui/skeleton"

export function CtaSkeleton() {
  return (
    <Box
      aria-hidden="true"
      className="rounded-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      display="flex"
      orientation="vertical"
      gap={2}
    >
      <Skeleton className="h-16 w-4/5 md:h-24" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="mt-6 h-10 w-40" />
    </Box>
  )
}
