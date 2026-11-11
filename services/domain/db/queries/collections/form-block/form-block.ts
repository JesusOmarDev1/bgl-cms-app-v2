import "server-only"

import { readItem, type Query } from "@directus/sdk"
import { publicDirectus } from "@/config/directus-public"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { FORM_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/form-block/form-block.fields"
import type { FormBlock } from "@/types/blocks/form/form-block"
import type { Schema } from "@/types/schema"

export async function getPublishedFormBlockQuery(
  id: string,
  failedToFetchMessage: string
) {
  try {
    return await publicDirectus.request(
      readItem("form_block", id, {
        fields: FORM_BLOCK_FIELDS,
        filter: { status: { _eq: "published" } },
      } satisfies Query<Schema, FormBlock>)
    )
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getPublishedFormBlockQuery",
      collection: "form_block",
    })
    return null
  }
}

export type PublishedFormBlockQueryResult = Awaited<
  ReturnType<typeof getPublishedFormBlockQuery>
>
