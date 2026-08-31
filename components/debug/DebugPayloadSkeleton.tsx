import { Box } from "@/components/shared/content/Box"
import { Skeleton } from "@/components/ui/skeleton"

export function DebugPayloadSkeleton() {
  return (
    <Box
      aria-hidden="true"
      className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
      display="flex"
      orientation="vertical"
    >
      <Box
        className="border-b border-border/40 px-3 py-2 sm:px-4"
        display="flex"
        orientation="horizontal"
        align="center"
        justify="between"
      >
        <Box display="flex" orientation="horizontal" align="center" gap={2}>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </Box>
        <Box display="flex" orientation="horizontal" align="center" gap={0.5}>
          <Skeleton className="size-10 rounded-md" />
          <Skeleton className="size-10 rounded-md" />
          <Skeleton className="size-10 rounded-md" />
          <Skeleton className="size-10 rounded-md" />
        </Box>
      </Box>
      <Box className="px-4 py-3" display="flex" orientation="vertical" gap={2}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12 ps-4" />
        <Skeleton className="h-4 w-5/6 ps-4" />
        <Skeleton className="h-4 w-4/5 ps-8" />
        <Skeleton className="h-4 w-2/3 ps-8" />
        <Skeleton className="h-4 w-3/4 ps-8" />
        <Skeleton className="h-4 w-7/12 ps-4" />
        <Skeleton className="h-4 w-2/3" />
      </Box>
    </Box>
  )
}
