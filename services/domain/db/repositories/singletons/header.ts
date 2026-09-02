import {
  getHeaderQuery,
  type HeaderQueryResult,
} from "@/services/domain/db/queries/singletons/header/header"

export async function getHeaderRepository(): Promise<HeaderQueryResult> {
  return await getHeaderQuery()
}
