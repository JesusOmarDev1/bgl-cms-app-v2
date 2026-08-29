import "server-only"

import { customEndpoint } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import type { SiteSettingsType } from "@/types/singletons/site-settings"

type SingletonResponse<T> = { data: T }

export const DEFAULT_SITE_SETTINGS: SiteSettingsType = {
  id: "site-settings-default",
  maintenance_enabled: false,
  maintenance_title: null,
  maintenance_message: null,
}

export async function getSiteSettingsQuery(): Promise<SiteSettingsType> {
  const t = await getTranslations("db.site_settings")

  try {
    const response = await directus.request(
      customEndpoint<SingletonResponse<SiteSettingsType>>({
        method: "GET",
        path: "/items/site_settings",
      })
    )

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...response.data,
      maintenance_enabled: Boolean(response.data?.maintenance_enabled),
    }
  } catch (error) {
    console.error(t("failed_to_fetch"), { cause: error })
    return DEFAULT_SITE_SETTINGS
  }
}
