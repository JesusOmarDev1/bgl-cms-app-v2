import "server-only"

import { readMe } from "@directus/sdk"
import { createPrivateDirectus } from "@/config/directus-private"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
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
    const me = await (
      await createPrivateDirectus(accessToken)
    ).request(
      readMe({
        // The SDK types `directus_users.avatar` as `string | file`, so its
        // query-fields union rejects nested relation objects even though the
        // server expands them at runtime.
        fields: [...SESSION_IDENTITY_FIELDS] as unknown as NonNullable<
          Parameters<typeof readMe>[0]
        >["fields"],
      })
    )
    // The expanded relation yields the avatar object; only the asset id
    // reaches the identity type (DirectusImage resolves the public URL).
    const avatar =
      typeof me.avatar === "object" && me.avatar !== null
        ? me.avatar.id
        : typeof me.avatar === "string"
          ? me.avatar
          : null
    return { ...me, avatar }
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getIdentityQuery",
      collection: "directus_users",
    })
    return null
  }
}
