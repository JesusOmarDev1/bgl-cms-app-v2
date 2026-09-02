import {
  getSiteSettingsQuery,
  type SiteSettingsQueryResult,
} from "@/services/domain/db/queries/singletons/site-settings/site-settings"

export async function getSiteSettingsRepository(): Promise<SiteSettingsQueryResult> {
  return await getSiteSettingsQuery()
}
