import * as v from "valibot"
import { parseDateString } from "@/lib/formatting/format-date"
import { DATE_REGEX } from "@/lib/validations/date"
import { DATETIME_LOCAL_REGEX } from "@/lib/validations/datetime"
import { EMAIL_REGEX } from "@/lib/validations/email"
import { TELEPHONE_REGEX } from "@/lib/validations/telephone"
import type { FormBlockQuery } from "@/services/domain/db/queries/blocks/form-block/form-block.fields"
import type { FormResponseAnswer } from "@/types/collections/form-responses"

export type ExpandedFormField = FormBlockQuery["fields"][number]

type NumberFormField = Extract<
  ExpandedFormField,
  { collection: "number_block" }
>["item"]

export const FORM_VALUE_MAX_LENGTH = 255

export type FormFieldMessages = {
  required: string
  maxLength: string
  email: string
  phone: string
  date: string
  datetime: string
  number: string
  checkbox: string
  minValue: (min: number) => string
  maxValue: (max: number) => string
}

function textSchema(required: boolean, messages: FormFieldMessages) {
  return required
    ? v.pipe(
        v.string(),
        v.minLength(1, messages.required),
        v.maxLength(FORM_VALUE_MAX_LENGTH, messages.maxLength)
      )
    : v.pipe(v.string(), v.maxLength(FORM_VALUE_MAX_LENGTH, messages.maxLength))
}

function patternSchema(
  required: boolean,
  pattern: RegExp,
  format: string,
  requiredMessage: string,
  maxLengthMessage: string
) {
  const matched = v.pipe(
    v.string(),
    v.maxLength(FORM_VALUE_MAX_LENGTH, maxLengthMessage),
    v.regex(pattern, format)
  )
  return required
    ? v.pipe(
        v.string(),
        v.minLength(1, requiredMessage),
        v.maxLength(FORM_VALUE_MAX_LENGTH, maxLengthMessage),
        v.regex(pattern, format)
      )
    : v.union([v.literal(""), matched])
}

function numberSchema(item: NumberFormField, messages: FormFieldMessages) {
  const base = v.pipe(v.number(messages.number), v.finite(messages.number))
  const bounded =
    item.min != null && item.max != null
      ? v.pipe(
          base,
          v.minValue(item.min, messages.minValue(item.min)),
          v.maxValue(item.max, messages.maxValue(item.max))
        )
      : item.min != null
        ? v.pipe(base, v.minValue(item.min, messages.minValue(item.min)))
        : item.max != null
          ? v.pipe(base, v.maxValue(item.max, messages.maxValue(item.max)))
          : base

  return item.required ? bounded : v.nullable(bounded)
}

function checkboxSchema(required: boolean, message: string) {
  return required ? v.literal(true, message) : v.boolean()
}

function schemaFor(row: ExpandedFormField, messages: FormFieldMessages) {
  switch (row.collection) {
    case "text_block":
    case "text_area_block":
      return textSchema(row.item.required, messages)
    case "email_block":
      return patternSchema(
        row.item.required,
        EMAIL_REGEX,
        messages.email,
        messages.required,
        messages.maxLength
      )
    case "phone_block":
      return patternSchema(
        row.item.required,
        TELEPHONE_REGEX,
        messages.phone,
        messages.required,
        messages.maxLength
      )
    case "number_block":
      return numberSchema(row.item, messages)
    case "date_block":
      return dateSchema(row.item.required, row.item.hours, messages)
    case "checkbox_block":
      return checkboxSchema(row.item.required, messages.checkbox)
  }
}

function dateSchema(
  required: boolean,
  hours: boolean,
  messages: FormFieldMessages
) {
  const pattern = hours ? DATETIME_LOCAL_REGEX : DATE_REGEX
  const format = hours ? messages.datetime : messages.date
  const matched = v.pipe(
    v.string(),
    v.maxLength(FORM_VALUE_MAX_LENGTH, messages.maxLength),
    v.regex(pattern, format),
    v.check((value) => parseDateString(value) !== undefined, format)
  )
  return required
    ? v.pipe(v.string(), v.minLength(1, messages.required), matched)
    : v.union([v.literal(""), matched])
}

export function buildFormValuesSchema(
  fields: readonly ExpandedFormField[],
  messages: FormFieldMessages
): v.GenericSchema<FormResponseAnswer> {
  const entries: v.ObjectEntries = {}

  for (const field of fields) {
    entries[field.item.identifier] = schemaFor(field, messages)
  }

  // Empty email/phone/date fail minLength and regex. Stop at the first issue.
  return v.config(v.object(entries), {
    abortPipeEarly: true,
  }) as v.GenericSchema<FormResponseAnswer>
}
