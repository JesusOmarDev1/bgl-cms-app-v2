import type { SiteSettingsType } from "@/types/singletons/site-settings"
import { getSiteSettingsQuery } from "@/services/domain/db/queries/singletons/site-settings"

export async function getSiteSettingsRepository(): Promise<SiteSettingsType> {
  return await getSiteSettingsQuery()
}
