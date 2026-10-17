import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { CtaBlock } from "@/types/blocks/content/cta-block"
import type { Schema } from "@/types/schema"

export const CTA_BLOCK_FIELDS = [
  "id",
  "title",
  "excerpt",
  "variant",
  "primary_button",
  "secondary_button",
  "secondary_url",
  "primary_url",
  "primary_icon",
  "secondary_icon",
  "sort",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, CtaBlock>["fields"]>

export type CtaBlockQuery = ApplyQueryFields<
  Schema,
  CtaBlock,
  typeof CTA_BLOCK_FIELDS
>
