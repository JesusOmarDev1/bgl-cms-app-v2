import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { LogosClientsBlock } from "@/types/blocks/content/logos-clients-block"
import type { Schema } from "@/types/schema"

export const LOGOS_CLIENTS_BLOCK_FIELDS = [
  "id",
  "title",
  "excerpt",
  "sort",
  "date_created",
  "date_updated",
  {
    clients: [
      "id",
      {
        clients_id: [
          "id",
          "status",
          "name",
          "website",
          "active",
          "slug",
          { logo: ["*"] },
          "date_created",
          "date_updated",
        ],
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, LogosClientsBlock>["fields"]>

export type LogosClientsBlockQuery = ApplyQueryFields<
  Schema,
  LogosClientsBlock,
  typeof LOGOS_CLIENTS_BLOCK_FIELDS
>
