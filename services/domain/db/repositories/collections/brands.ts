import {
  getBrandsCountQuery,
  getBrandsQuery,
  type BrandsQuery,
  type BrandsQueryResult,
} from "@/services/domain/db/queries/collections/brands/brands"

export async function getBrandsRepository({
  status = "published",
  limit = 10,
  page = 1,
}: BrandsQuery = {}): Promise<BrandsQueryResult> {
  return await getBrandsQuery({ status, limit, page })
}

export async function getBrandsCountRepository({
  status = "published",
}: Pick<BrandsQuery, "status"> = {}): Promise<number> {
  return await getBrandsCountQuery({ status })
}
