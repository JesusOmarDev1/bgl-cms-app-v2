import { getTranslations } from "next-intl/server"
import {
  getPhonesCountQuery,
  getPhonesQuery,
  type PhonesQuery,
  type PhonesQueryResult,
} from "@/services/domain/db/queries/collections/phones/phones"

export async function getPhonesRepository({
  limit = 10,
  page = 1,
}: PhonesQuery = {}): Promise<PhonesQueryResult> {
  const t = await getTranslations("db.phones")
  return await getPhonesQuery({ limit, page }, t("failed_to_fetch"))
}

export async function getPhonesCountRepository(): Promise<number> {
  const t = await getTranslations("db.phones")
  return await getPhonesCountQuery(t("failed_to_fetch"))
}
