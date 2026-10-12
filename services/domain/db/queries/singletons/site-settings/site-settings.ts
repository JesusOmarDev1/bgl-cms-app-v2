import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { cacheLife, cacheTag } from "next/cache"

import directus from "@/config/directus"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import type { Schema } from "@/types/schema"
import type { SiteSettingsType } from "@/types/singletons/site-settings"
import { SITE_SETTINGS_FIELDS } from "./site-settings.fields"

async function fetchSiteSettings() {
  "use cache"
  cacheTag("site_settings")
  cacheLife("minutes")
  return directus.request(
    readSingleton("site_settings", {
      fields: SITE_SETTINGS_FIELDS,
    } satisfies Query<Schema, SiteSettingsType>)
  )
}

export async function getSiteSettingsQuery(failedToFetchMessage: string) {
  try {
    return await fetchSiteSettings()
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
