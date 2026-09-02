import type { Query } from "@directus/sdk"

import type { Schema } from "@/types/schema"
import type { WhatsappButtonType } from "@/types/singletons/whatsapp-button"

export const WHATSAPP_BUTTON_FIELDS = [
  "id",
  "tooltip_message",
  "tooltip_title",
  "url",
  "date_created",
  "date_updated",
] as const satisfies Query<Schema, WhatsappButtonType>["fields"]
