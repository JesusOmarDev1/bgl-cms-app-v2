import * as v from "valibot"
import { DATE_REGEX } from "@/lib/validations/date"
import { EMAIL_REGEX } from "@/lib/validations/email"
import { TELEPHONE_REGEX } from "@/lib/validations/telephone"
import type { FormBlockQuery } from "@/services/domain/db/queries/blocks/form-block/form-block.fields"
import type { FormResponseAnswer } from "@/types/collections/form-responses"
import { DATETIME_LOCAL_REGEX } from "@/lib/validations/datetime"

export type ExpandedFormField = FormBlockQuery["fields"][number]

type NumberFormField = Extract<
  ExpandedFormField,
  { collection: "number_block" }
>["item"]

function textSchema(required: boolean) {
  return required
    ? v.pipe(v.string(), v.minLength(1), v.maxLength(255))
    : v.pipe(v.string(), v.maxLength(255))
}

function patternSchema(required: boolean, pattern: RegExp) {
  const matched = v.pipe(v.string(), v.regex(pattern))
  return required ? matched : v.union([v.literal(""), matched])
}

function numberSchema(item: NumberFormField) {
  const bounded =
    item.min != null && item.max != null
      ? v.pipe(v.number(), v.minValue(item.min), v.maxValue(item.max))
      : item.min != null
        ? v.pipe(v.number(), v.minValue(item.min))
        : item.max != null
          ? v.pipe(v.number(), v.maxValue(item.max))
          : v.number()

  return item.required ? bounded : v.nullable(bounded)
}

function checkboxSchema(required: boolean) {
  return required ? v.literal(true) : v.boolean()
}

function schemaFor(row: ExpandedFormField) {
  switch (row.collection) {
    case "text_block":
    case "text_area_block":
      return textSchema(row.item.required)
    case "email_block":
      return patternSchema(row.item.required, EMAIL_REGEX)
    case "phone_block":
      return patternSchema(row.item.required, TELEPHONE_REGEX)
    case "number_block":
      return numberSchema(row.item)
    case "date_block":
      return patternSchema(
        row.item.required,
        row.item.hours ? DATETIME_LOCAL_REGEX : DATE_REGEX
      )
    case "checkbox_block":
      return checkboxSchema(row.item.required)
  }
}

export function expandedFormFields(
  fields: FormBlockQuery["fields"]
): ExpandedFormField[] {
  return fields
}

export function buildFormValuesSchema(
  fields: readonly ExpandedFormField[]
): v.GenericSchema<FormResponseAnswer> {
  const entries: v.ObjectEntries = {}

  for (const field of fields) {
    entries[field.item.identifier] = schemaFor(field)
  }

  return v.object(entries) as v.GenericSchema<FormResponseAnswer>
}
