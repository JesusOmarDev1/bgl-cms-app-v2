import { getTranslations } from "next-intl/server"
import { MaintenanceView } from "@/components/maintenance/MaintenanceView"
import { getSiteSettingsRepository } from "@/services/domain/db/repositories/singletons/site-settings"
import { Suspense } from "react"
import { MaintenanceViewSkeleton } from "@/components/maintenance/MaintenanceViewSkeleton"
import { metadata as createMetadata } from "@/lib/seo/metadata"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ""

export const metadata = createMetadata({
  title: {
    default: "Pagina de mantenimiento",
  },
  description: "Esta pagina es para fines de mantenimiento del sitio web.",
  keywords: ["maintenance", "maintenance page", "maintenance mode"],
  canonical: `${BASE_URL}/maintenance`,
  openGraph: {
    title: "Pagina de mantenimiento",
    description: "Esta pagina es para fines de mantenimiento del sitio web.",
    type: "website",
  },
})

export default async function MaintenancePage() {
  const t = await getTranslations("maintenance")
  const siteSettings = await getSiteSettingsRepository()

  return (
    <Suspense fallback={<MaintenanceViewSkeleton />}>
      <MaintenanceView
        title={siteSettings.maintenance_title || t("title")}
        message={siteSettings.maintenance_message || t("message")}
        statusLabel={t("statusLabel")}
        helperText={t("helperText")}
      />
    </Suspense>
  )
}

export const instant = false
