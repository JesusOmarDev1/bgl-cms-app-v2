import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { Skeleton } from "@/components/ui/skeleton"

export function HeroSkeleton() {
  return (
    <div aria-hidden="true" className="flex w-full flex-col gap-8 py-12">
      <BoxContainer>
        <Box display="flex" orientation="vertical" gap={2}>
          <Skeleton className="h-14 w-3/4 md:h-20" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="mt-2 h-10 w-36" />
        </Box>
      </BoxContainer>
      <Skeleton className="h-[28rem] w-full rounded-none" />
    </div>
  )
}
