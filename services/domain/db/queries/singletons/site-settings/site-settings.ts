import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { cacheLife, cacheTag } from "next/cache"

import directus from "@/config/directus"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import type { Schema } from "@/types/schema"
import type { SiteSettingsType } from "@/types/singletons/site-settings"
import { SITE_SETTINGS_FIELDS } from "./site-settings.fields"

export async function getSiteSettingsQuery(failedToFetchMessage: string) {
  "use cache"
  cacheTag("site_settings")
  cacheLife("minutes")
  try {
    return await directus.request(
      readSingleton("site_settings", {
        fields: SITE_SETTINGS_FIELDS,
      } satisfies Query<Schema, SiteSettingsType>)
    )
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
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
