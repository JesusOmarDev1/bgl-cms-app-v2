import {
  getSubLinksCountQuery,
  getSubLinksQuery,
  type SubLinksQuery,
  type SubLinksQueryResult,
} from "@/services/domain/db/queries/collections/sub-links/sub-links"

export async function getSubLinksRepository({
  limit = 10,
  page = 1,
}: SubLinksQuery = {}): Promise<SubLinksQueryResult> {
  return await getSubLinksQuery({ limit, page })
}

export async function getSubLinksCountRepository(): Promise<number> {
  return await getSubLinksCountQuery()
}
