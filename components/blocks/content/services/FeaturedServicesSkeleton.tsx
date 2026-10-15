import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { Skeleton } from "@/components/ui/skeleton"

export function FeaturedServicesSkeleton() {
  return (
    <BoxContainer aria-hidden="true">
      <Box
        display="flex"
        gap={3}
        orientation="vertical"
        paddingBottom={3}
        paddingTop={3}
      >
        <Skeleton className="h-8 w-1/3" />
        <Box align="center" cols={{ base: 1, md: 2 }} display="grid" gap={2}>
          <Skeleton className="h-56 w-full rounded-xl" />
          <Box display="flex" gap={2} orientation="vertical">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </Box>
        </Box>
      </Box>
    </BoxContainer>
  )
}
