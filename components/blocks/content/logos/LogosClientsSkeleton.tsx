import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { Skeleton } from "@/components/ui/skeleton"

export function LogosClientsSkeleton() {
  return (
    <BoxContainer aria-hidden="true">
      <Box
        align="center"
        display="flex"
        gap={2}
        orientation="vertical"
        paddingBottom={3}
        paddingTop={3}
      >
        <Skeleton className="h-8 w-1/3" />
        <div className="flex justify-center gap-8">
          <Skeleton className="h-16 w-28" />
          <Skeleton className="h-16 w-28" />
          <Skeleton className="h-16 w-28" />
        </div>
      </Box>
    </BoxContainer>
  )
}
