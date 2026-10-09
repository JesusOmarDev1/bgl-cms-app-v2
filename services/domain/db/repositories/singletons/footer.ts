import { getTranslations } from "next-intl/server"
import {
  getFooterQuery,
  type FooterQueryResult,
} from "@/services/domain/db/queries/singletons/footer/footer"

export async function getFooterRepository(): Promise<FooterQueryResult> {
  const t = await getTranslations("db.footer")
  return await getFooterQuery(t("failed_to_fetch"))
}
