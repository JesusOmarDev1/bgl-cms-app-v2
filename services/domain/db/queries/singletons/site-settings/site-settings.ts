import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { cacheLife, cacheTag } from "next/cache"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import type { Schema } from "@/types/schema"
import type { SiteSettingsType } from "@/types/singletons/site-settings"
import { SITE_SETTINGS_FIELDS } from "./site-settings.fields"

export async function getSiteSettingsQuery() {
  "use cache"
  cacheTag("site_settings")
  cacheLife("minutes")
  const t = await getTranslations("db.site_settings")

  try {
    return await directus.request(
      readSingleton("site_settings", {
        fields: SITE_SETTINGS_FIELDS,
      } satisfies Query<Schema, SiteSettingsType>)
    )
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getSiteSettingsQuery",
      collection: "site_settings",
    })
    return null
  }
}

export type SiteSettingsQueryResult = Awaited<
  ReturnType<typeof getSiteSettingsQuery>
>
