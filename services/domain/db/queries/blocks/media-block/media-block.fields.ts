import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { MediaBlock } from "@/types/blocks/content/media-block"
import type { Schema } from "@/types/schema"

export const MEDIA_BLOCK_FIELDS = [
  "id",
  "title",
  "type",
  "sort",
  "excerpt",
  "date_created",
  "date_updated",
  {
    file: ["*"],
    image: ["*"],
    video: ["*"],
    audio: ["*"],
    files: ["id", { directus_files_id: ["*"] }],
  },
] as const satisfies NonNullable<Query<Schema, MediaBlock>["fields"]>

export type MediaBlockQuery = ApplyQueryFields<
  Schema,
  MediaBlock,
  typeof MEDIA_BLOCK_FIELDS
>
