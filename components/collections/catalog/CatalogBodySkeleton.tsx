import { Box } from "@/components/shared/content/Box"
import { Skeleton } from "@/components/ui/skeleton"

export function CatalogBodySkeleton() {
  return (
    <Box
      aria-hidden="true"
      cols={{ base: 1, sm: 2, lg: 3 }}
      display="grid"
      gap={2}
    >
      <Skeleton className="h-96 w-full rounded-xl" />
      <Skeleton className="hidden h-96 w-full rounded-xl sm:block" />
      <Skeleton className="hidden h-96 w-full rounded-xl lg:block" />
    </Box>
  )
}
