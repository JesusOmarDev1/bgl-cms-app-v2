import {
  getFooterQuery,
  type FooterQueryResult,
} from "@/services/domain/db/queries/singletons/footer/footer"

export async function getFooterRepository(): Promise<FooterQueryResult> {
  return await getFooterQuery()
}
