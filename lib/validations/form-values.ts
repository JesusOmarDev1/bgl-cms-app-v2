import * as v from "valibot"
import { DATE_REGEX } from "@/lib/validations/date"
import { EMAIL_REGEX } from "@/lib/validations/email"
import { TELEPHONE_REGEX } from "@/lib/validations/telephone"
import type { CheckboxBlock } from "@/types/blocks/form/fields/checkbox-block"
import type { DateBlock } from "@/types/blocks/form/fields/date-block"
import type { EmailBlock } from "@/types/blocks/form/fields/email-block"
import type { NumberBlock } from "@/types/blocks/form/fields/number-block"
import type { PhoneBlock } from "@/types/blocks/form/fields/phone-block"
import type { TextAreaBlock } from "@/types/blocks/form/fields/text-area-block"
import type { TextBlock } from "@/types/blocks/form/fields/text-block"
import type { FormBlock } from "@/types/blocks/form/form-block"
import type { FormResponseAnswer } from "@/types/collections/form-responses"
import type { FormBlockFieldsCollection } from "@/types/collections/junctions/form-block-fields"
import { DATETIME_LOCAL_REGEX } from "@/lib/validations/datetime"

type ExpandedFormFieldBase = {
  id: number
  sort: number | null
}

export type ExpandedFormField =
  | (ExpandedFormFieldBase & { collection: "text_block"; item: TextBlock })
  | (ExpandedFormFieldBase & {
      collection: "text_area_block"
      item: TextAreaBlock
    })
  | (ExpandedFormFieldBase & { collection: "number_block"; item: NumberBlock })
  | (ExpandedFormFieldBase & { collection: "date_block"; item: DateBlock })
  | (ExpandedFormFieldBase & { collection: "email_block"; item: EmailBlock })
  | (ExpandedFormFieldBase & {
      collection: "checkbox_block"
      item: CheckboxBlock
    })
  | (ExpandedFormFieldBase & { collection: "phone_block"; item: PhoneBlock })

const FORM_FIELD_COLLECTIONS: Record<FormBlockFieldsCollection, true> = {
  text_block: true,
  text_area_block: true,
  number_block: true,
  date_block: true,
  email_block: true,
  checkbox_block: true,
  phone_block: true,
}

type FormFieldInput =
  | number
  | {
      collection?: unknown
      item?: unknown
    }

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
  fields: FormBlock["fields"] | readonly FormFieldInput[]
): ExpandedFormField[] {
  const rows: readonly FormFieldInput[] = fields
  return rows.filter((row) => {
    if (typeof row === "number") return false
    const item = row.item
    return (
      typeof row.collection === "string" &&
      Object.hasOwn(FORM_FIELD_COLLECTIONS, row.collection) &&
      typeof item === "object" &&
      item !== null &&
      "identifier" in item &&
      typeof item.identifier === "string"
    )
  }) as ExpandedFormField[]
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
