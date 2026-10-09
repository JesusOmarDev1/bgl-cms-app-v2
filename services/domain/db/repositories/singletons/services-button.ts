import { getTranslations } from "next-intl/server"
import {
  getServicesButtonQuery,
  type ServicesButtonQueryResult,
} from "@/services/domain/db/queries/singletons/services-button/services-button"

export async function getServicesButtonRepository(): Promise<ServicesButtonQueryResult> {
  const t = await getTranslations("db.services_button")
  return await getServicesButtonQuery(t("failed_to_fetch"))
}
