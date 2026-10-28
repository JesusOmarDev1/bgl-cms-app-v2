import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductDetailSkeleton() {
  return (
    <BoxContainer aria-hidden="true">
      <Box
        display="flex"
        gap={1.5}
        orientation="vertical"
        paddingBottom={3}
        paddingTop={2}
      >
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-2/3 max-w-md" />
        <Box cols={{ base: 1, lg: 2 }} display="grid" gap={2}>
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <Box display="flex" gap={1} orientation="vertical">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </Box>
        </Box>
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </Box>
    </BoxContainer>
  )
}
