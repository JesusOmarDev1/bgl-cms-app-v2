import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { MaintenanceView } from "@/components/maintenance/MaintenanceView"
import { MaintenanceViewSkeleton } from "@/components/maintenance/MaintenanceViewSkeleton"
import { WEBSITE_URL } from "@/lib/env/constants"
import { metadata as createMetadata } from "@/lib/seo/metadata"
import { getSiteSettingsRepository } from "@/services/domain/db/repositories/singletons/site-settings"

export const metadata = createMetadata({
  title: "Pagina de mantenimiento",
  description: "Esta pagina es para fines de mantenimiento del sitio web.",
  keywords: ["maintenance", "maintenance page", "maintenance mode"],
  canonical: `${WEBSITE_URL}/maintenance`,
  openGraph: {
    title: "Pagina de mantenimiento",
    description: "Esta pagina es para fines de mantenimiento del sitio web.",
    type: "website",
  },
})

async function MaintenancePageContent() {
  const [t, siteSettings] = await Promise.all([
    getTranslations("maintenance"),
    getSiteSettingsRepository(),
  ])

  return (
    <MaintenanceView
      title={siteSettings?.maintenance_title || t("title")}
      message={siteSettings?.maintenance_message || t("message")}
      statusLabel={t("statusLabel")}
      helperText={t("helperText")}
    />
  )
}

export default function MaintenancePage() {
  return (
    <Suspense
      defer
      name="maintenance-view"
      fallback={<MaintenanceViewSkeleton />}
    >
      <MaintenancePageContent />
    </Suspense>
  )
}

export const instant = false
