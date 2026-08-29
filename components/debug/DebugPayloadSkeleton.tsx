import { Box } from "@/components/shared/content/Box"
import { Skeleton } from "@/components/ui/skeleton"

export function DebugPayloadSkeleton() {
  return (
    <Box
      aria-hidden="true"
      className="overflow-hidden rounded-xl border border-border/60"
      display="flex"
      orientation="vertical"
      gap={2}
      padding={4}
    >
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </Box>
  )
}
