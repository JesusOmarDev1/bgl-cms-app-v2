import {
  getPublishedFormBlockQuery,
  type PublishedFormBlockQueryResult,
} from "@/services/domain/db/queries/collections/form-block/form-block"

export async function getPublishedFormBlockRepository(
  id: string
): Promise<PublishedFormBlockQueryResult> {
  return await getPublishedFormBlockQuery(id)
}
