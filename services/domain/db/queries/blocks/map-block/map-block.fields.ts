import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { MapBlock } from "@/types/blocks/content/map-block"
import type { Schema } from "@/types/schema"

export const MAP_BLOCK_FIELDS = [
  "id",
  "sort",
  "title",
  "url_embed",
  "excerpt",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, MapBlock>["fields"]>

export type MapBlockQuery = ApplyQueryFields<
  Schema,
  MapBlock,
  typeof MAP_BLOCK_FIELDS
>
