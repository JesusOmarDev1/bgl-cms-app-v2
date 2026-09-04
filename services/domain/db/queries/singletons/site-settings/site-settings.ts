import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import type { Schema } from "@/types/schema"
import type { SiteSettingsType } from "@/types/singletons/site-settings"
import { SITE_SETTINGS_FIELDS } from "./site-settings.fields"

export async function getSiteSettingsQuery() {
  const t = await getTranslations("db.site_settings")

  try {
    return await directus.request(
      readSingleton("site_settings", {
        fields: SITE_SETTINGS_FIELDS,
      } satisfies Query<Schema, SiteSettingsType>)
    )
  } catch (error) {
    const message = t("failed_to_fetch")
    logDirectusQueryError(error, message, {
      component: "db.queries",
      operation: "getSiteSettingsQuery",
      collection: "site_settings",
    })
    throw error instanceof Error ? error : new Error(message)
  }
}

export type SiteSettingsQueryResult = Awaited<
  ReturnType<typeof getSiteSettingsQuery>
>
