import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { QrCodeBlock } from "@/types/blocks/content/qr-code-block"
import type { Schema } from "@/types/schema"

export const QR_CODE_BLOCK_FIELDS = [
  "id",
  "sort",
  "title",
  "size",
  "alignment",
  "url",
  "excerpt",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, QrCodeBlock>["fields"]>

export type QrCodeBlockQuery = ApplyQueryFields<
  Schema,
  QrCodeBlock,
  typeof QR_CODE_BLOCK_FIELDS
>
