import "server-only"

import { readMe } from "@directus/sdk"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { createSessionClient } from "@/services/domain/server/auth/token"
import { SESSION_IDENTITY_FIELDS } from "@/services/domain/db/queries/collections/session/session.fields"
import type { SessionIdentityTypes } from "@/types/collections/session"

/**
 * Reads the signed-in employee's own identity for this request only.
 * Never cached: the payload is per-user private data tied to request cookies.
 */
export async function getIdentityQuery(
  accessToken: string,
  failedToFetchMessage: string
): Promise<SessionIdentityTypes | null> {
  try {
    return await (
      await createSessionClient(accessToken)
    ).request(readMe({ fields: [...SESSION_IDENTITY_FIELDS] }))
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getIdentityQuery",
      collection: "directus_users",
    })
    return null
  }
}
