import type { ApplyQueryFields, Query } from "@directus/sdk"
import { CONTENT_COLUMN_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/content-column-block/content-column-block.fields"
import type { ContentBlock } from "@/types/blocks/content/html/content-block"
import type { Schema } from "@/types/schema"

export const CONTENT_BLOCK_FIELDS = [
  "id",
  "sort",
  "title",
  "layout",
  "padding",
  "padding_top",
  "padding_bottom",
  "date_created",
  "date_updated",
  {
    content: [
      "id",
      "collection",
      {
        item: {
          content_column_block: CONTENT_COLUMN_BLOCK_FIELDS,
        },
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, ContentBlock>["fields"]>

export type ContentBlockQuery = ApplyQueryFields<
  Schema,
  ContentBlock,
  typeof CONTENT_BLOCK_FIELDS
>
