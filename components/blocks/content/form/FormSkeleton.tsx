import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { Skeleton } from "@/components/ui/skeleton"

export function FormSkeleton() {
  return (
    <BoxContainer aria-hidden="true">
      <Box display="flex" orientation="vertical" gap={2}>
        <Skeleton className="h-[37.5px] w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-y-5">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
      </Box>
    </BoxContainer>
  )
}
