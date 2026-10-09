import { getTranslations } from "next-intl/server"
import {
  getWhatsappButtonQuery,
  type WhatsappButtonQueryResult,
} from "@/services/domain/db/queries/singletons/whatsapp-button/whatsapp-button"

export async function getWhatsappButtonRepository(): Promise<WhatsappButtonQueryResult> {
  const t = await getTranslations("db.whatsapp_button")
  return await getWhatsappButtonQuery(t("failed_to_fetch"))
}
