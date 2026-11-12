"use server"

import * as v from "valibot"
import { isDirectusError, updateMe } from "@directus/sdk"
import { actionClient } from "@/lib/server/safe-action"
import { createPrivateDirectus } from "@/config/directus-private"
import { readAuthSession } from "@/services/domain/server/auth/token"
import { classifyDirectusError } from "@/lib/directus/classify-error"
import { DIRECTUS_URL } from "@/lib/env/constants"

// Empty string/array clears the field in Directus; all five fields are always sent.
const profileSchema = v.object({
  firstName: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(80))),
  lastName: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(80))),
  title: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(80))),
  location: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(120))),
  description: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(500))),
})

type ProfileResult = { ok: true } | { ok: false; message: string }

export const updateProfile = actionClient
  .inputSchema(profileSchema)
  .action(async ({ parsedInput }): Promise<ProfileResult> => {
    const session = await readAuthSession()
    if (!session?.accessToken) {
      return { ok: false, message: "sessionExpired" }
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

// Validation runs inside the action (not the schema) so failures map to the
// stable photoTooLarge / photoInvalidType keys instead of validationErrors.
const MAX_AVATAR_BYTES = 2 * 1024 * 1024

const uploadAvatarSchema = v.object({ photo: v.unknown() })

export const uploadAvatar = actionClient
  .inputSchema(uploadAvatarSchema)
  .action(async ({ parsedInput }): Promise<ProfileResult> => {
    const photo = parsedInput.photo
    if (!(photo instanceof File)) {
      return { ok: false, message: "photoInvalidType" }
    }
    if (photo.size > MAX_AVATAR_BYTES) {
      return { ok: false, message: "photoTooLarge" }
    }
    if (!photo.type.startsWith("image/")) {
      return { ok: false, message: "photoInvalidType" }
    }

    const session = await readAuthSession()
    if (!session?.accessToken) {
      return { ok: false, message: "sessionExpired" }
    }

    try {
      const form = new FormData()
      form.append("file", photo)
      const uploadResponse = await fetch(`${DIRECTUS_URL}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body: form,
        signal: AbortSignal.timeout(10_000),
      })
      if (!uploadResponse.ok) {
        return { ok: false, message: "generic" }
      }
      const payload = (await uploadResponse.json()) as {
        data?: { id?: unknown }
      }
      const fileId = payload.data?.id
      if (typeof fileId !== "string" || !fileId) {
        return { ok: false, message: "generic" }
      }

      const client = await createPrivateDirectus(session.accessToken)
      await client.request(updateMe({ avatar: fileId }))
      return { ok: true }
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        return { ok: false, message: "unavailable" }
      }
      if (isDirectusError(error)) {
        const { category } = classifyDirectusError(error, "mutation")
        if (category === "accessDenied") {
          return { ok: false, message: "accessDenied" }
        }
        if (category === "sessionExpired" || category === "sessionInvalid") {
          return { ok: false, message: "sessionExpired" }
        }
        if (category === "generic") {
          return { ok: false, message: "generic" }
        }
        return { ok: false, message: "unavailable" }
      }
      return { ok: false, message: "unavailable" }
    }
  })
