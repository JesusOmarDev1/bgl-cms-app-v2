import {
  getRedirectsCountQuery,
  getRedirectsQuery,
  type RedirectsQuery,
  type RedirectsQueryResult,
} from "@/services/domain/db/queries/collections/redirects/redirects"

export async function getRedirectsRepository({
  limit = 10,
  page = 1,
}: RedirectsQuery = {}): Promise<RedirectsQueryResult> {
  return await getRedirectsQuery({ limit, page })
}

export async function getRedirectsCountRepository(): Promise<number> {
  return await getRedirectsCountQuery()
}
