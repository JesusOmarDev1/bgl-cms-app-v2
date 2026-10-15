import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { Skeleton } from "@/components/ui/skeleton"

export function DivisionServicesSkeleton() {
  return (
    <BoxContainer aria-hidden="true">
      <Box
        display="flex"
        gap={2}
        orientation="vertical"
        paddingBottom={3}
        paddingTop={3}
      >
        <Skeleton className="h-8 w-1/3" />
        <Box cols={{ base: 1, sm: 2, lg: 3 }} display="grid" gap={2}>
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="hidden h-64 w-full rounded-xl lg:block" />
        </Box>
      </Box>
    </BoxContainer>
  )
}
