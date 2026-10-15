import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { Skeleton } from "@/components/ui/skeleton"

export function CarouselSkeleton() {
  return (
    <BoxContainer aria-hidden="true">
      <Box
        display="flex"
        orientation="vertical"
        gap={2}
        paddingTop={3}
        paddingBottom={3}
      >
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </Box>
    </BoxContainer>
  )
}
