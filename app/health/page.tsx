import { Suspense } from "react"
import { HealthStatus } from "@/components/health/HealthStatus"
import { HealthStatusSkeleton } from "@/components/health/HealthStatusSkeleton"
import { Box } from "@/components/shared/content/Box"

export default function Page() {
  return (
    <Box
      display="flex"
      className="h-dvh"
      justify="center"
      align="center"
      gap={4}
    >
      <Suspense
        defer
        name="health-status"
        key="health-status"
        fallback={<HealthStatusSkeleton />}
      >
        <HealthStatus />
      </Suspense>
    </Box>
  )
}
