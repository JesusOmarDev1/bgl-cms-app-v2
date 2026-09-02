import {
  getSeoCountQuery,
  getSeoQuery,
  type SeoQuery,
  type SeoQueryResult,
} from "@/services/domain/db/queries/collections/seo/seo"

export async function getSeoRepository({
  limit = 10,
  page = 1,
}: SeoQuery = {}): Promise<SeoQueryResult> {
  return await getSeoQuery({ limit, page })
}

export async function getSeoCountRepository(): Promise<number> {
  return await getSeoCountQuery()
}
