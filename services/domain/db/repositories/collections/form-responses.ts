import {
  createFormResponseQuery,
  type CreateFormResponseInput,
  type CreateFormResponseQueryResult,
} from "@/services/domain/db/queries/collections/form-responses/form-responses"

export async function createFormResponseRepository(
  input: CreateFormResponseInput
): Promise<CreateFormResponseQueryResult> {
  return await createFormResponseQuery(input)
}
