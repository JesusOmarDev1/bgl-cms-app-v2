"use server"

import * as v from "valibot"
import { isDirectusError, updateMe } from "@directus/sdk"
import { actionClient } from "@/lib/server/safe-action"
import { createPrivateDirectus } from "@/config/directus-private"
import { readAuthSession } from "@/services/domain/server/auth/token"
import { classifyDirectusError } from "@/lib/directus/classify-error"

// Empty string/array clears the field in Directus; all six fields are always sent.
// tags arrives as one comma-separated string (max 1000 chars); the action splits,
// trims, drops empties/duplicates and enforces 20 tags × 50 chars each.
const profileSchema = v.object({
  firstName: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(80))),
  lastName: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(80))),
  title: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(80))),
  location: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(120))),
  description: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(500))),
  tags: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(1000))),
})

type ProfileResult = { ok: true } | { ok: false; message: string }

export const updateProfile = actionClient
  .inputSchema(profileSchema)
  .action(async ({ parsedInput }): Promise<ProfileResult> => {
    const session = await readAuthSession()
    if (!session?.accessToken) {
      return { ok: false, message: "sessionExpired" }
    }

    const tags = [
      ...new Set(
        (parsedInput.tags ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      ),
    ]
    if (tags.length > 20 || tags.some((tag) => tag.length > 50)) {
      return { ok: false, message: "validationFailed" }
    }

    try {
      const client = await createPrivateDirectus(session.accessToken)
      await client.request(
        updateMe({
          first_name: parsedInput.firstName ?? "",
          last_name: parsedInput.lastName ?? "",
          title: parsedInput.title ?? "",
          location: parsedInput.location ?? "",
          description: parsedInput.description ?? "",
          tags,
        })
      )
      return { ok: true }
    } catch (error) {
      if (isDirectusError(error)) {
        const { category } = classifyDirectusError(error, "mutation")
        if (category === "accessDenied") {
          return { ok: false, message: "accessDenied" }
        }
        if (category === "sessionExpired" || category === "sessionInvalid") {
          return { ok: false, message: "sessionExpired" }
        }
        if (category === "validationFailed") {
          return { ok: false, message: "validationFailed" }
        }
        if (category === "generic") {
          return { ok: false, message: "generic" }
        }
        return { ok: false, message: "unavailable" }
      }
      return { ok: false, message: "unavailable" }
    }
  })
