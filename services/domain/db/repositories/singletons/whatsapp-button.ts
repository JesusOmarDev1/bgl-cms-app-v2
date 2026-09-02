import {
  getWhatsappButtonQuery,
  type WhatsappButtonQueryResult,
} from "@/services/domain/db/queries/singletons/whatsapp-button/whatsapp-button"

export async function getWhatsappButtonRepository(): Promise<WhatsappButtonQueryResult> {
  return await getWhatsappButtonQuery()
}
