import { Box } from "@/components/shared/content/Box"
import { Skeleton } from "@/components/ui/skeleton"

export function DebugToolbarSkeleton() {
  return (
    <Box
      aria-hidden="true"
      className="sticky top-0 z-10 rounded-xl border border-border/60 bg-card shadow-sm"
      display="flex"
      orientation="vertical"
      padding={1}
      gap={0.75}
    >
      <Box display="flex" orientation="vertical" gap={0.25}>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </Box>
      <Box
        className="w-full"
        display="flex"
        orientation="horizontal"
        align="end"
        gap={0.5}
        wrap="wrap"
      >
        <Box
          display="flex"
          orientation="vertical"
          gap={0.5}
          className="w-full sm:w-auto"
        >
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-52 rounded-lg" />
        </Box>
        <Box
          className="w-full min-w-0 flex-1 sm:min-w-56"
          display="flex"
          orientation="vertical"
          gap={0.5}
        >
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full min-w-56 rounded-lg" />
        </Box>
        <Skeleton className="h-10 w-full min-w-24 self-end rounded-lg sm:w-24" />
      </Box>
      <Box
        className="w-full"
        display="flex"
        orientation="horizontal"
        align="center"
        justify="center"
        gap={0.25}
      >
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </Box>
    </Box>
  )
}
