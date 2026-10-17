import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { SuppliersBlock } from "@/types/blocks/content/suppliers-block"
import type { Schema } from "@/types/schema"

export const SUPPLIERS_BLOCK_FIELDS = [
  "id",
  "title",
  "excerpt",
  "sort",
  "date_created",
  "date_updated",
  {
    suppliers: [
      "id",
      "collection",
      {
        item: {
          suppliers: [
            "id",
            "name",
            "status",
            "active",
            "website",
            "slug",
            { logo: ["*"] },
            "date_created",
            "date_updated",
          ],
        },
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, SuppliersBlock>["fields"]>

export type SuppliersBlockQuery = ApplyQueryFields<
  Schema,
  SuppliersBlock,
  typeof SUPPLIERS_BLOCK_FIELDS
>
