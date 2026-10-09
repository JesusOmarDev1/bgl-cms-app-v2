import { getTranslations } from "next-intl/server"
import {
  getPublishedFormBlockQuery,
  type PublishedFormBlockQueryResult,
} from "@/services/domain/db/queries/collections/form-block/form-block"

export async function getPublishedFormBlockRepository(
  id: string
): Promise<PublishedFormBlockQueryResult> {
  const t = await getTranslations("db.form_block")
  return await getPublishedFormBlockQuery(id, t("failed_to_fetch"))
}
