"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import * as v from "valibot"
import { actionClient } from "@/lib/server/safe-action"
import { verifyTurnstile } from "@/lib/security/turnstile"
import {
  buildFormValuesSchema,
  FORM_VALUE_MAX_LENGTH,
} from "@/lib/validations/form-values"
import { formLimiter } from "@/config/rate-limiter"
import { UUID_REGEX } from "@/lib/validations/uuid"
import { getPublishedFormBlockRepository } from "@/services/domain/db/repositories/collections/form-block"
import { createFormResponseRepository } from "@/services/domain/db/repositories/collections/form-responses"

const submitFormSchema = v.object({
  formId: v.pipe(v.string(), v.regex(UUID_REGEX)),
  captchaToken: v.optional(v.string()),
  values: v.record(
    v.string(),
    v.union([v.string(), v.number(), v.boolean(), v.null()])
  ),
})

type SubmitFormData =
  | { ok: true }
  | {
      ok: false
      message: string
      fieldErrors?: Record<string, string>
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

export const submitForm = actionClient
  .inputSchema(submitFormSchema)
  .action(async ({ parsedInput }): Promise<SubmitFormData> => {
    const { formId, captchaToken, values } = parsedInput
    const t = await getTranslations("db.form_responses")
    const forwarded = (await headers()).get("x-forwarded-for")
    const clientIp = forwarded
      ?.trim()
      .toLowerCase()
      .replace(/^::ffff:/, "")
    if (!clientIp || clientIp.includes(",")) {
      console.warn("[form] rate limited")
      return { ok: false, message: t("rate_limited") }
    }
    try {
      await formLimiter.consume(clientIp)
    } catch {
      console.warn("[form] rate limited")
      return { ok: false, message: t("rate_limited") }
    }
    const form = await getPublishedFormBlockRepository(formId)

    if (!form) {
      return { ok: false, message: t("not_found") }
    }

    if (form.captcha && !(await verifyTurnstile(captchaToken ?? ""))) {
      return { ok: false, message: t("captcha_failed") }
    }

    const fields = form.fields
    if (fields.length === 0) {
      return { ok: false, message: t("not_found") }
    }

    const parsed = v.safeParse(
      buildFormValuesSchema(fields, {
        required: t("required"),
        maxLength: t("max_length", { max: FORM_VALUE_MAX_LENGTH }),
        email: t("email"),
        phone: t("phone"),
        date: t("date"),
        datetime: t("datetime"),
        number: t("number"),
        checkbox: t("checkbox"),
        minValue: (min) => t("min_value", { min }),
        maxValue: (max) => t("max_value", { max }),
      }),
      values
    )
    if (!parsed.success) {
      return {
        ok: false,
        message: t("invalid"),
        fieldErrors: fieldErrorsFromIssues(parsed.issues),
      }
    }

    const created = await createFormResponseRepository({
      form: formId,
      answer: parsed.output,
    })
    if (!created?.id) {
      return { ok: false, message: t("failed_to_create") }
    }

    return { ok: true }
  })
