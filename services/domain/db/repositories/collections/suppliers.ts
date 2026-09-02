import {
  getSuppliersCountQuery,
  getSuppliersQuery,
  type SuppliersQuery,
  type SuppliersQueryResult,
} from "@/services/domain/db/queries/collections/suppliers/suppliers"

export async function getSuppliersRepository({
  status = "published",
  limit = 10,
  page = 1,
}: SuppliersQuery = {}): Promise<SuppliersQueryResult> {
  return await getSuppliersQuery({ status, limit, page })
}

export async function getSuppliersCountRepository({
  status = "published",
}: Pick<SuppliersQuery, "status"> = {}): Promise<number> {
  return await getSuppliersCountQuery({ status })
}
