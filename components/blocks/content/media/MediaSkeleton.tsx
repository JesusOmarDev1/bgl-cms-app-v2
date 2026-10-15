import { Box } from "@/components/shared/content/Box"
import { Skeleton } from "@/components/ui/skeleton"

export function MediaSkeleton() {
  return (
    <Box aria-hidden="true" display="flex" orientation="vertical" gap={2}>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </Box>
  )
}
