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
  return await getPhonesQuery({ limit, page })
}

export async function getPhonesCountRepository(): Promise<number> {
  return await getPhonesCountQuery()
}
