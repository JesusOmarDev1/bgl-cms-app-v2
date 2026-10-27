import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { ClientsBlock } from "@/types/blocks/content/clients-block"
import type { Schema } from "@/types/schema"

export const CLIENTS_BLOCK_FIELDS = [
  "id",
  "title",
  "excerpt",
  "sort",
  "date_created",
  "date_updated",
  {
    clients: [
      "id",
      "collection",
      {
        item: {
          clients: [
            "id",
            "name",
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
] as const satisfies NonNullable<Query<Schema, ClientsBlock>["fields"]>

export type ClientsBlockQuery = ApplyQueryFields<
  Schema,
  ClientsBlock,
  typeof CLIENTS_BLOCK_FIELDS
>
