import { Fragment, Suspense } from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { HealthStatus } from "@/components/health/HealthStatus"
import { HealthStatusSkeleton } from "@/components/health/HealthStatusSkeleton"
import { NetworkStatus } from "@/components/network/NetworkStatus"
import { NetworkStatusSkeleton } from "@/components/network/NetworkStatusSkeleton"
import { Box } from "@/components/shared/content/Box"
import { HeaderSpacer } from "@/components/blocks/singletons/header/HeaderSpacer"

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
    <Fragment>
      <HeaderSpacer />
      <Box
        display="flex"
        orientation={{ base: "vertical", lg: "horizontal" }}
        className="min-h-dvh"
        justify="evenly"
        align="center"
        gap={2}
        wrap="wrap"
      >
        <Suspense
          defer
          name="health-status"
          key="health-status"
          fallback={<HealthStatusSkeleton />}
        >
          <HealthStatus />
        </Suspense>
        <Suspense
          defer
          name="network-status"
          key="network-status"
          fallback={<NetworkStatusSkeleton />}
        >
          <NetworkStatus />
        </Suspense>
      </Box>
    </Fragment>
  )
}
