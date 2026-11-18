import {
  getPrivateScalesQuery,
  type PrivateScalesQuery,
  type PrivateScalesQueryResult,
} from "@/services/domain/db/queries/collections/private-metrology/scales/scales"

export async function getPrivateScalesRepository({
  ...query
}: PrivateScalesQuery): Promise<PrivateScalesQueryResult> {
  return getPrivateScalesQuery(query)
}
