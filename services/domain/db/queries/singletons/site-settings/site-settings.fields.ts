import "server-only"

import type { Query } from "@directus/sdk"
import type { Schema } from "@/types/schema"
import type { SiteSettingsType } from "@/types/singletons/site-settings"

export const SITE_SETTINGS_FIELDS = [
  "id",
  "maintenance_mode",
  "maintenance_title",
  "maintenance_message",
] as const satisfies NonNullable<Query<Schema, SiteSettingsType>["fields"]>
