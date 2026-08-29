import { Box } from "@/components/shared/content/Box"
import { Skeleton } from "@/components/ui/skeleton"

export function DebugToolbarSkeleton() {
  return (
    <Box display="flex" orientation="vertical" gap={3} aria-hidden="true">
      <Skeleton className="h-7 w-40" />
      <Box display="flex" orientation="horizontal" align="center" gap={2}>
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </Box>
    </Box>
  )
}
