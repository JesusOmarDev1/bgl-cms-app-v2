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
  return await getEmailsQuery({ limit, page })
}

export async function getEmailsCountRepository(): Promise<number> {
  return await getEmailsCountQuery()
}
