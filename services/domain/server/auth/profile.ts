"use server"

import * as v from "valibot"
import { updateMe, uploadFiles } from "@directus/sdk"
import { actionClient } from "@/lib/server/safe-action"
import { createPrivateDirectus } from "@/config/directus-private"
import { readAuthSession } from "@/services/domain/server/auth/token"
import { getDirectusCodes } from "@/lib/directus/directus-error"

// Empty string/array clears the field in Directus; all five fields are always sent.
const profileSchema = v.object({
  firstName: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(80))),
  lastName: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(80))),
  title: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(80))),
  location: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(120))),
  description: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(500))),
})

type ProfileResult = { ok: true } | { ok: false; message: string }

const SESSION_EXPIRED = { ok: false, message: "sessionExpired" } as const

async function accessToken(): Promise<string | null> {
  return (await readAuthSession())?.accessToken ?? null
}

// Every failure maps to one stable key. A failure without any official code never
// reached Directus (transport, timeout, foreign error), so it is "unavailable";
// a known but unbranched code falls back to "generic", as the docs prescribe.
function failureResult(error: unknown): ProfileResult {
  const codes = getDirectusCodes(error)
  if (codes.length === 0) return { ok: false, message: "unavailable" }
  switch (codes[0]) {
    case "TOKEN_EXPIRED":
    case "INVALID_TOKEN":
    case "USER_SUSPENDED":
    case "INVALID_IP":
      return { ok: false, message: "sessionExpired" }
    case "FORBIDDEN":
      return { ok: false, message: "accessDenied" }
    case "FAILED_VALIDATION":
      return { ok: false, message: "validationFailed" }
    case "CONTENT_TOO_LARGE":
      return { ok: false, message: "photoTooLarge" }
    case "SERVICE_UNAVAILABLE":
      return { ok: false, message: "unavailable" }
    default:
      return { ok: false, message: "generic" }
  }
}

export const updateProfile = actionClient
  .inputSchema(profileSchema)
  .action(async ({ parsedInput }): Promise<ProfileResult> => {
    const token = await accessToken()
    if (!token) return SESSION_EXPIRED

    try {
      const client = await createPrivateDirectus(token)
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
      return failureResult(error)
    }
  })

// Validation runs inside the action (not the schema) so failures map to the
// stable photoTooLarge / photoInvalidType keys instead of validationErrors.
const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

const uploadAvatarSchema = v.object({ photo: v.unknown() })

export const uploadAvatar = actionClient
  .inputSchema(uploadAvatarSchema)
  .action(async ({ parsedInput }): Promise<ProfileResult> => {
    const photo = parsedInput.photo
    if (!(photo instanceof File) || !ALLOWED_AVATAR_TYPES.has(photo.type)) {
      return { ok: false, message: "photoInvalidType" }
    }
    if (photo.size > MAX_AVATAR_BYTES) {
      return { ok: false, message: "photoTooLarge" }
    }

    const token = await accessToken()
    if (!token) return SESSION_EXPIRED

    try {
      const client = await createPrivateDirectus(token)
      const form = new FormData()
      form.append("file", photo)
      const file = await client.request(uploadFiles(form))
      await client.request(updateMe({ avatar: file.id }))
      return { ok: true }
    } catch (error) {
      return failureResult(error)
    }
  })
