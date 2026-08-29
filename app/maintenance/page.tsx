import { getTranslations } from "next-intl/server"
import { MaintenanceView } from "@/components/maintenance/MaintenanceView"
import { getSiteSettingsRepository } from "@/services/domain/db/repositories/singletons/site-settings"

export const instant = false

export default async function MaintenancePage() {
  const [t, siteSettings] = await Promise.all([
    getTranslations("maintenance"),
    getSiteSettingsRepository(),
  ])

  return (
    <MaintenanceView
      title={siteSettings.maintenance_title || t("title")}
      message={siteSettings.maintenance_message || t("message")}
      statusLabel={t("statusLabel")}
      helperText={t("helperText")}
    />
  )
}
