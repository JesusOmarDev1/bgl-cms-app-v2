import {
  getServicesButtonQuery,
  type ServicesButtonQueryResult,
} from "@/services/domain/db/queries/singletons/services-button/services-button"

export async function getServicesButtonRepository(): Promise<ServicesButtonQueryResult> {
  return await getServicesButtonQuery()
}
