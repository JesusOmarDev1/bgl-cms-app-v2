import { getTranslations } from "next-intl/server"
import {
  createFormResponseQuery,
  type CreateFormResponseInput,
  type CreateFormResponseQueryResult,
} from "@/services/domain/db/queries/collections/form-responses/form-responses"

export async function createFormResponseRepository(
  input: CreateFormResponseInput
): Promise<CreateFormResponseQueryResult> {
  const t = await getTranslations("db.form_responses")
  return await createFormResponseQuery(input, t("failed_to_create"))
}
