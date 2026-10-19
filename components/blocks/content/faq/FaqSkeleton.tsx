import { Box } from "@/components/shared/content/Box"
import { Skeleton } from "@/components/ui/skeleton"

export function FaqSkeleton() {
  return (
    <Box aria-hidden="true" display="flex" orientation="vertical" gap={2}>
      <Skeleton className="h-[37.5px] w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-[54px] w-full" />
      <Skeleton className="h-[54px] w-full" />
      <Skeleton className="h-[54px] w-full" />
    </Box>
  )
}
