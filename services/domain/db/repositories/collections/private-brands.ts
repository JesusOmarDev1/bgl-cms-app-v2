import {
  getPrivateBrandsQuery,
  type PrivateBrandsQuery,
  type PrivateBrandsQueryResult,
} from "@/services/domain/db/queries/collections/private-metrology/brands/brands"

export async function getPrivateBrandsRepository({
  ...query
}: PrivateBrandsQuery): Promise<PrivateBrandsQueryResult> {
  return getPrivateBrandsQuery(query)
}
