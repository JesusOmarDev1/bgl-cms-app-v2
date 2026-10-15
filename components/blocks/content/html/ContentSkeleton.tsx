import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { Skeleton } from "@/components/ui/skeleton"

export function ContentSkeleton() {
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
        <Box display="grid" cols={{ base: 1, md: 2 }} gap={2}>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </Box>
      </Box>
    </BoxContainer>
  )
}
