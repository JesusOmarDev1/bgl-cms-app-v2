import {
  getPrivateSuppliersQuery,
  type PrivateSuppliersQuery,
  type PrivateSuppliersQueryResult,
} from "@/services/domain/db/queries/collections/private-metrology/suppliers/suppliers"

export async function getPrivateSuppliersRepository({
  ...query
}: PrivateSuppliersQuery): Promise<PrivateSuppliersQueryResult> {
  return getPrivateSuppliersQuery(query)
}
