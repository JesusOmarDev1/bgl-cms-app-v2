import {
  getUrlLinksCountQuery,
  getUrlLinksQuery,
  type UrlLinksQuery,
  type UrlLinksQueryResult,
} from "@/services/domain/db/queries/collections/url-links/url-links"

export async function getUrlLinksRepository({
  limit = 10,
  page = 1,
}: UrlLinksQuery = {}): Promise<UrlLinksQueryResult> {
  return await getUrlLinksQuery({ limit, page })
}

export async function getUrlLinksCountRepository(): Promise<number> {
  return await getUrlLinksCountQuery()
}
