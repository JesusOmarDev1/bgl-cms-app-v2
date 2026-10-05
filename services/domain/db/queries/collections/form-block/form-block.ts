import "server-only"

import { readItem, type Query } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { FORM_BLOCK_FIELDS } from "@/services/domain/db/queries/collections/pages/pages.fields"
import type { FormBlock } from "@/types/blocks/form/form-block"
import type { Schema } from "@/types/schema"

export async function getPublishedFormBlockQuery(id: string) {
  const t = await getTranslations("db.form_block")

  try {
    return await directus.request(
      readItem("form_block", id, {
        fields: FORM_BLOCK_FIELDS,
        filter: { status: { _eq: "published" } },
      } satisfies Query<Schema, FormBlock>)
    )
  } catch (error) {
    returnDirectusQueryError(error, t("failed_to_fetch"), {
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
