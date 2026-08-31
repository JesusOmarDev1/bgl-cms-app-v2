import "server-only"

import { readSingleton } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import type { SiteSettingsType } from "@/types/singletons/site-settings"

export const DEFAULT_SITE_SETTINGS: SiteSettingsType = {
  id: "site-settings-default",
  maintenance_mode: false,
  maintenance_title: null,
  maintenance_message: null,
}

export async function getSiteSettingsQuery(): Promise<SiteSettingsType> {
  const t = await getTranslations("db.site_settings")

  try {
    const row = await directus.request(
      readSingleton("site_settings", {
        fields: [
          "id",
          "maintenance_mode",
          "maintenance_title",
          "maintenance_message",
        ],
      })
    )

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...row,
      id: row.id ?? DEFAULT_SITE_SETTINGS.id,
      maintenance_mode: Boolean(row.maintenance_mode),
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : t("failed_to_fetch")

    if (error instanceof Error && error.cause !== undefined) {
      console.error(message, { cause: error.cause })
    } else {
      console.error(message)
    }

    return DEFAULT_SITE_SETTINGS
  }
}
