import { getTranslations } from "next-intl/server"

import { getIdentityQuery } from "@/services/domain/db/queries/collections/session/session"
import type { SessionIdentityTypes } from "@/types/collections/session"

export async function getIdentityRepository({
  accessToken,
}: {
  accessToken: string
}): Promise<SessionIdentityTypes | null> {
  const t = await getTranslations("db.session")
  return await getIdentityQuery(accessToken, t("failed_to_fetch"))
}
