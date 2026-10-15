import { Box } from "@/components/shared/content/Box"
import { Skeleton } from "@/components/ui/skeleton"

export function QrCodeSkeleton() {
  return (
    <Box
      aria-hidden="true"
      align="center"
      display="flex"
      orientation="vertical"
      gap={2}
    >
      <Skeleton className="h-8 w-48" />
      <Skeleton className="size-52" />
    </Box>
  )
}
