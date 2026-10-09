import { getTranslations } from "next-intl/server"
import {
  getHeaderQuery,
  type HeaderQueryResult,
} from "@/services/domain/db/queries/singletons/header/header"

export async function getHeaderRepository(): Promise<HeaderQueryResult> {
  const t = await getTranslations("db.header")
  return await getHeaderQuery(t("failed_to_fetch"))
}
