import * as v from "valibot"
import { DATE_REGEX } from "@/lib/validations/date"
import { EMAIL_REGEX } from "@/lib/validations/email"
import { TELEPHONE_REGEX } from "@/lib/validations/telephone"
import type { NumberBlock } from "@/types/blocks/form/fields/number-block"
import type { FormBlockFieldsJunction } from "@/types/collections/junctions/form-block-fields"

const DATETIME_LOCAL_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

type FormFieldItem = Exclude<FormBlockFieldsJunction["item"], string>

function textSchema(required: boolean) {
  return required
    ? v.pipe(v.string(), v.minLength(1), v.maxLength(255))
    : v.pipe(v.string(), v.maxLength(255))
}

function patternSchema(required: boolean, pattern: RegExp) {
  const matched = v.pipe(v.string(), v.regex(pattern))
  return required ? matched : v.union([v.literal(""), matched])
}

function numberSchema(item: NumberBlock) {
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
  return required
    ? v.pipe(
        v.boolean(),
        v.check((value) => value === true)
      )
    : v.boolean()
}

function schemaFor(
  collection: FormBlockFieldsJunction["collection"],
  item: FormFieldItem
) {
  switch (collection) {
    case "text_block":
    case "text_area_block":
      return textSchema(item.required)
    case "email_block":
      return patternSchema(item.required, EMAIL_REGEX)
    case "phone_block":
      return patternSchema(item.required, TELEPHONE_REGEX)
    case "number_block":
      return "min" in item
        ? numberSchema(item)
        : item.required
          ? v.number()
          : v.nullable(v.number())
    case "date_block":
      return patternSchema(
        item.required,
        "hours" in item && item.hours ? DATETIME_LOCAL_REGEX : DATE_REGEX
      )
    case "checkbox_block":
      return checkboxSchema(item.required)
  }
}

export function buildFormValuesSchema(
  fields: readonly FormBlockFieldsJunction[]
) {
  const entries: v.ObjectEntries = {}

  for (const field of fields) {
    if (typeof field.item === "string") continue
    entries[field.item.identifier] = schemaFor(field.collection, field.item)
  }

  return v.object(entries)
}
