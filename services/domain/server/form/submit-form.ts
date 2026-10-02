"use server"

import { readItem, type Query } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import * as v from "valibot"
import directus from "@/config/directus"
import { actionClient } from "@/lib/server/safe-action"
import { buildFormValuesSchema } from "@/lib/validations/form-values"
import { UUID_REGEX } from "@/lib/validations/uuid"
import { FORM_BLOCK_FIELDS } from "@/services/domain/db/queries/collections/pages/pages.fields"
import { createFormResponseRepository } from "@/services/domain/db/repositories/collections/form-responses"
import type { FormBlock } from "@/types/blocks/form/form-block"
import type {
  FormBlockFieldsCollection,
  FormBlockFieldsJunction,
} from "@/types/collections/junctions/form-block-fields"
import type { FormResponseAnswer } from "@/types/collections/form-responses"
import type { Schema } from "@/types/schema"

const FIELD_COLLECTIONS = [
  "text_block",
  "text_area_block",
  "number_block",
  "date_block",
  "email_block",
  "checkbox_block",
  "phone_block",
] as const satisfies readonly FormBlockFieldsCollection[]

const submitFormSchema = v.object({
  formId: v.pipe(v.string(), v.regex(UUID_REGEX)),
  captchaToken: v.optional(v.string()),
  values: v.record(
    v.string(),
    v.union([v.string(), v.number(), v.boolean(), v.null()])
  ),
})

const MISSING_FORM_MESSAGE = "No se encontró el formulario."
const CAPTCHA_MESSAGE = "No se pudo verificar el captcha."
const INVALID_FORM_MESSAGE = "Revisa los campos del formulario."

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify"

type SubmitFormData =
  | { ok: true }
  | {
      ok: false
      message: string
      fieldErrors?: Record<string, string>
    }

function isFieldCollection(value: string): value is FormBlockFieldsCollection {
  return (FIELD_COLLECTIONS as readonly string[]).includes(value)
}

function isExpandedJunction(value: unknown): value is FormBlockFieldsJunction {
  if (typeof value !== "object" || value === null) return false
  if (!("collection" in value) || typeof value.collection !== "string") {
    return false
  }
  if (!isFieldCollection(value.collection)) return false
  if (!("item" in value)) return false
  return typeof value.item === "object" && value.item !== null
}

function expandedJunctions(fields: unknown): FormBlockFieldsJunction[] | null {
  if (!Array.isArray(fields)) return null
  const expanded: FormBlockFieldsJunction[] = []
  for (const row of fields) {
    if (isExpandedJunction(row)) {
      expanded.push(row)
      continue
    }
    if (
      typeof row === "object" &&
      row !== null &&
      "item" in row &&
      typeof row.item === "string"
    ) {
      continue
    }
    return null
  }
  if (fields.length > 0 && expanded.length === 0) return null
  return expanded
}

function fieldErrorsFromIssues(
  issues: readonly {
    readonly message: string
    readonly path?: readonly { readonly key: unknown }[] | undefined
  }[]
): Record<string, string> | undefined {
  const fieldErrors: Record<string, string> = {}
  for (const issue of issues) {
    const key = issue.path?.[0]?.key
    if (typeof key !== "string" || Object.hasOwn(fieldErrors, key)) continue
    fieldErrors[key] = issue.message
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
}

function toFormResponseAnswer(output: unknown): FormResponseAnswer | null {
  if (typeof output !== "object" || output === null || Array.isArray(output)) {
    return null
  }
  const answer: FormResponseAnswer = {}
  for (const [key, value] of Object.entries(output)) {
    if (value === undefined) continue
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      answer[key] = value
      continue
    }
    return null
  }
  return answer
}

function isTurnstileSuccess(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === true
  )
}

async function verifyTurnstile(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    })
    if (!response.ok) return false
    const payload: unknown = await response.json()
    return isTurnstileSuccess(payload)
  } catch {
    return false
  }
}

async function readPublishedForm(formId: string) {
  try {
    return await directus.request(
      readItem("form_block", formId, {
        fields: FORM_BLOCK_FIELDS,
        filter: { status: { _eq: "published" } },
      } as const satisfies Query<Schema, FormBlock>)
    )
  } catch {
    return null
  }
}

export const submitForm = actionClient
  .inputSchema(submitFormSchema)
  .action(async ({ parsedInput }): Promise<SubmitFormData> => {
    const { formId, captchaToken, values } = parsedInput
    const t = await getTranslations("db.form_responses")
    const form = await readPublishedForm(formId)

    if (
      !form ||
      form.status !== "published" ||
      typeof form.captcha !== "boolean"
    ) {
      return { ok: false, message: MISSING_FORM_MESSAGE }
    }

    if (form.captcha) {
      const token = captchaToken?.trim()
      const secret = process.env.TURNSTILE_SECRET_KEY
      if (!token || !secret || !(await verifyTurnstile(token, secret))) {
        return { ok: false, message: CAPTCHA_MESSAGE }
      }
    }

    const fields = expandedJunctions(form.fields)
    if (!fields) {
      return { ok: false, message: MISSING_FORM_MESSAGE }
    }

    const parsed = v.safeParse(buildFormValuesSchema(fields), values)
    if (!parsed.success) {
      return {
        ok: false,
        message: INVALID_FORM_MESSAGE,
        fieldErrors: fieldErrorsFromIssues(parsed.issues),
      }
    }

    const answer = toFormResponseAnswer(parsed.output)
    if (!answer) {
      return { ok: false, message: INVALID_FORM_MESSAGE }
    }

    const created = await createFormResponseRepository({
      form: formId,
      answer,
    })
    if (!created?.id) {
      return { ok: false, message: t("failed_to_create") }
    }

    return { ok: true }
  })
