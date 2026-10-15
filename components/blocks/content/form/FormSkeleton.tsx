import { Box } from "@/components/shared/content/Box"
import { Skeleton } from "@/components/ui/skeleton"

export function FormSkeleton() {
  return (
    <Box aria-hidden="true" display="flex" orientation="vertical" gap={2}>
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-32" />
    </Box>
  )
}
