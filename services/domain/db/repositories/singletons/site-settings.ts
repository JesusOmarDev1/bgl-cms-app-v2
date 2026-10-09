import { getTranslations } from "next-intl/server"
import {
  getSiteSettingsQuery,
  type SiteSettingsQueryResult,
} from "@/services/domain/db/queries/singletons/site-settings/site-settings"

export async function getSiteSettingsRepository(): Promise<SiteSettingsQueryResult> {
  const t = await getTranslations("db.site_settings")
  return await getSiteSettingsQuery(t("failed_to_fetch"))
}
