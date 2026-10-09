import { getTranslations } from "next-intl/server"
import {
  getEmailsCountQuery,
  getEmailsQuery,
  type EmailsQuery,
  type EmailsQueryResult,
} from "@/services/domain/db/queries/collections/emails/emails"

export async function getEmailsRepository({
  limit = 10,
  page = 1,
}: EmailsQuery = {}): Promise<EmailsQueryResult> {
  const t = await getTranslations("db.emails")
  return await getEmailsQuery({ limit, page }, t("failed_to_fetch"))
}

export async function getEmailsCountRepository(): Promise<number> {
  const t = await getTranslations("db.emails")
  return await getEmailsCountQuery(t("failed_to_fetch"))
}
