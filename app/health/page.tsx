import { Suspense } from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { HealthStatus } from "@/components/health/HealthStatus"
import { HealthStatusSkeleton } from "@/components/health/HealthStatusSkeleton"
import { Box } from "@/components/shared/content/Box"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("health")
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  }
}

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
