import { getTranslations } from "next-intl/server"
import {
  getManualsBySlugQuery,
  getManualsCountQuery,
  getManualsQuery,
  type ManualsQuery,
  type ManualsQueryResult,
} from "@/services/domain/db/queries/collections/manuals/manuals"

export async function getManualsRepository({
  status = "published",
  limit = 10,
  page = 1,
}: ManualsQuery = {}): Promise<ManualsQueryResult> {
  const t = await getTranslations("db.manuals")
  return await getManualsQuery({ status, limit, page }, t("failed_to_fetch"))
}

export async function getManualBySlugRepository({
  status = "published",
  limit = 1,
  page = 1,
  slug,
}: ManualsQuery & { slug: string }): Promise<ManualsQueryResult> {
  const t = await getTranslations("db.manuals")
  return await getManualsBySlugQuery(
    { status, limit, page },
    slug,
    t("failed_to_fetch")
  )
}

export async function getManualsCountRepository({
  status = "published",
}: Pick<ManualsQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.manuals")
  return await getManualsCountQuery({ status }, t("failed_to_fetch"))
}
