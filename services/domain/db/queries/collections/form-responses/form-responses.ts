import "server-only"

import { createItem, type Query } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import type {
  FormResponseAnswer,
  FormResponsesTypes,
} from "@/types/collections/form-responses"
import type { FormResponseStatusType } from "@/types/enums/form-response-status"
import type { Schema } from "@/types/schema"

const FORM_RESPONSE_FIELDS = ["id"] as const

export interface CreateFormResponseInput {
  form: string
  answer: FormResponseAnswer
}

export async function createFormResponseQuery({
  form,
  answer,
}: CreateFormResponseInput) {
  const t = await getTranslations("db.form_responses")
  const status = "new" satisfies FormResponseStatusType

  try {
    return await directus.request(
      createItem("form_responses", { status, form, answer }, {
        fields: FORM_RESPONSE_FIELDS,
      } as const satisfies Query<Schema, FormResponsesTypes>)
    )
  } catch (error) {
    returnDirectusQueryError(error, t("failed_to_create"), {
      component: "db.queries",
      operation: "createFormResponseQuery",
      collection: "form_responses",
    })
    return null
  }
}

export type CreateFormResponseQueryResult = Awaited<
  ReturnType<typeof createFormResponseQuery>
>
