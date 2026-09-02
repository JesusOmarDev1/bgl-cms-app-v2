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
  return await getManualsQuery({ status, limit, page })
}

export async function getManualBySlugRepository({
  status = "published",
  limit = 1,
  page = 1,
  slug,
}: ManualsQuery & { slug: string }): Promise<ManualsQueryResult> {
  return await getManualsBySlugQuery({ status, limit, page }, slug)
}

export async function getManualsCountRepository({
  status = "published",
}: Pick<ManualsQuery, "status"> = {}): Promise<number> {
  return await getManualsCountQuery({ status })
}
