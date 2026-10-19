import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { ContentColumnBlock } from "@/types/blocks/content/html/content-column-block"
import type { Schema } from "@/types/schema"

export const CONTENT_COLUMN_BLOCK_FIELDS = [
  "id",
  "content",
  "sort",
  "title",
  "padding",
  "padding_inline",
  "background_color",
  "padding_bottom",
  "padding_top",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, ContentColumnBlock>["fields"]>

export type ContentColumnQuery = ApplyQueryFields<
  Schema,
  ContentColumnBlock,
  typeof CONTENT_COLUMN_BLOCK_FIELDS
>
