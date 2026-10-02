"use client"

import { useMemo, useState } from "react"
import { Turnstile } from "@marsidev/react-turnstile"
import { useForm, type StandardSchemaV1 } from "@tanstack/react-form"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Button } from "@/components/ui/button"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { InputCheckboxClient } from "@/components/blocks/content/form/fields/InputCheckboxClient"
import {
  dateFieldDefault,
  InputDateClient,
} from "@/components/blocks/content/form/fields/InputDateClient"
import { InputEmailClient } from "@/components/blocks/content/form/fields/InputEmailClient"
import { InputNumberClient } from "@/components/blocks/content/form/fields/InputNumberClient"
import { InputPhoneClient } from "@/components/blocks/content/form/fields/InputPhoneClient"
import { InputTextAreaClient } from "@/components/blocks/content/form/fields/InputTextAreaClient"
import { InputTextClient } from "@/components/blocks/content/form/fields/InputTextClient"
import { buildFormValuesSchema } from "@/lib/validations/form-values"
import type { CheckboxBlock } from "@/types/blocks/form/fields/checkbox-block"
import type { DateBlock } from "@/types/blocks/form/fields/date-block"
import type { EmailBlock } from "@/types/blocks/form/fields/email-block"
import type { NumberBlock } from "@/types/blocks/form/fields/number-block"
import type { PhoneBlock } from "@/types/blocks/form/fields/phone-block"
import type { TextAreaBlock } from "@/types/blocks/form/fields/text-area-block"
import type { TextBlock } from "@/types/blocks/form/fields/text-block"
import type { FormBlock } from "@/types/blocks/form/form-block"
import type {
  FormBlockFieldsCollection,
  FormBlockFieldsJunction,
} from "@/types/collections/junctions/form-block-fields"

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

type FieldBlock = Exclude<FormBlockFieldsJunction["item"], string>
type ExpandedField = FormBlockFieldsJunction & { item: FieldBlock }
type FormValue = string | number | boolean | null
type FormValues = Record<string, FormValue>

function isExpandedField(
  row: number | FormBlockFieldsJunction
): row is ExpandedField {
  return typeof row !== "number" && typeof row.item !== "string"
}

function expandedFields(fields: FormBlock["fields"]): ExpandedField[] {
  const rows: ExpandedField[] = []
  for (const row of fields) {
    if (!isExpandedField(row)) continue
    rows.push(row)
  }
  return rows.sort(
    (a, b) =>
      (a.sort ?? Number.MAX_SAFE_INTEGER) - (b.sort ?? Number.MAX_SAFE_INTEGER)
  )
}

function defaultValue(
  collection: FormBlockFieldsCollection,
  item: FieldBlock
): FormValue {
  switch (collection) {
    case "checkbox_block":
      return (item as CheckboxBlock).default === "true"
    case "number_block":
      return (item as NumberBlock).default
    case "date_block": {
      const block = item as DateBlock
      return dateFieldDefault(block.default, block.hours)
    }
    case "text_block":
    case "text_area_block":
    case "email_block":
    case "phone_block":
      return (item as TextBlock).default ?? ""
  }
}

function defaultValues(rows: readonly ExpandedField[]): FormValues {
  const values: FormValues = {}
  for (const row of rows) {
    values[row.item.identifier] = defaultValue(row.collection, row.item)
  }
  return values
}

function toFieldErrors<T>(
  issues: readonly T[],
  serverMessage?: string
): { message: string }[] | undefined {
  const errors: { message: string }[] = []
  for (const issue of issues) {
    if (typeof issue === "string" && issue) {
      errors.push({ message: issue })
      continue
    }
    if (
      typeof issue === "object" &&
      issue !== null &&
      "message" in issue &&
      typeof issue.message === "string" &&
      issue.message
    ) {
      errors.push({ message: issue.message })
    }
  }
  if (serverMessage) errors.push({ message: serverMessage })
  return errors.length > 0 ? errors : undefined
}

function FormHeading({ data }: { data: FormBlock }) {
  return (
    <>
      <h2 id={`${data.id}-title`} className="flex items-center gap-2">
        {data.icon ? <MaterialIcon name={data.icon} /> : null}
        {data.title}
      </h2>
      <SafeHtml content={data.excerpt ?? undefined} preset="compact" />
    </>
  )
}

function FieldControl({
  collection,
  item,
  value,
  onChange,
  onBlur,
  errors,
}: {
  collection: FormBlockFieldsCollection
  item: FieldBlock
  value: FormValue
  onChange: (value: FormValue) => void
  onBlur: () => void
  errors?: { message: string }[]
}) {
  switch (collection) {
    case "text_block":
      return (
        <InputTextClient
          data={item as TextBlock}
          value={typeof value === "string" ? value : ""}
          onChange={(next) => onChange(next)}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "text_area_block":
      return (
        <InputTextAreaClient
          data={item as TextAreaBlock}
          value={typeof value === "string" ? value : ""}
          onChange={(next) => onChange(next)}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "email_block":
      return (
        <InputEmailClient
          data={item as EmailBlock}
          value={typeof value === "string" ? value : ""}
          onChange={(next) => onChange(next)}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "phone_block":
      return (
        <InputPhoneClient
          data={item as PhoneBlock}
          value={typeof value === "string" ? value : ""}
          onChange={(next) => onChange(next)}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "number_block":
      return (
        <InputNumberClient
          data={item as NumberBlock}
          value={typeof value === "number" ? value : null}
          onChange={(next) => onChange(next)}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "date_block":
      return (
        <InputDateClient
          data={item as DateBlock}
          value={typeof value === "string" ? value : ""}
          onChange={(next) => onChange(next)}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "checkbox_block":
      return (
        <InputCheckboxClient
          data={item as CheckboxBlock}
          value={value === true}
          onChange={(next) => onChange(next)}
          onBlur={onBlur}
          errors={errors}
        />
      )
  }
}

export function FormView({
  data,
  onSubmit,
  isSubmitting = false,
  submitted = false,
  formMessage,
  serverFieldErrors,
}: {
  data: FormBlock
  onSubmit: (values: FormValues, captchaToken: string) => void
  isSubmitting?: boolean
  submitted?: boolean
  formMessage?: string
  serverFieldErrors?: Record<string, string>
}) {
  const rows = useMemo(() => expandedFields(data.fields), [data.fields])
  const values = useMemo(() => defaultValues(rows), [rows])
  const schema = useMemo(() => buildFormValuesSchema(rows), [rows])
  const [captchaToken, setCaptchaToken] = useState("")
  const [prevFormMessage, setPrevFormMessage] = useState(formMessage)
  if (formMessage !== prevFormMessage) {
    setPrevFormMessage(formMessage)
    if (formMessage) setCaptchaToken("")
  }
  const form = useForm({
    defaultValues: values,
    validators: {
      // ObjectEntries types the schema input as unknown. The runtime schema is the field record.
      onSubmit: schema as StandardSchemaV1<FormValues, unknown>,
    },
    onSubmit: ({ value }) => {
      onSubmit(value, captchaToken)
    },
  })

  return (
    <Box display="flex" orientation="vertical" gap={2}>
      <FormHeading data={data} />
      {submitted ? (
        <p role="status">Recibimos tu información. Gracias.</p>
      ) : (
        <form
          aria-labelledby={`${data.id}-title`}
          className="flex w-full flex-col gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup className="flex-row flex-wrap items-start gap-x-0 gap-y-5">
            {rows.map((row) => (
              <div
                key={row.id}
                className="box-border min-w-0 px-1"
                style={{ width: `${row.item.width}%` }}
              >
                <form.Field name={row.item.identifier}>
                  {(field) => (
                    <FieldControl
                      collection={row.collection}
                      item={row.item}
                      value={field.state.value}
                      onChange={(next) => field.handleChange(next)}
                      onBlur={field.handleBlur}
                      errors={toFieldErrors(
                        field.state.meta.errors,
                        serverFieldErrors?.[row.item.identifier]
                      )}
                    />
                  )}
                </form.Field>
              </div>
            ))}
          </FieldGroup>
          {data.captcha && turnstileSiteKey ? (
            <Turnstile
              key={formMessage ?? "idle"}
              siteKey={turnstileSiteKey}
              options={{ theme: "dark", language: "es" }}
              onSuccess={setCaptchaToken}
              onExpire={() => setCaptchaToken("")}
              onError={() => setCaptchaToken("")}
            />
          ) : null}
          {formMessage ? (
            <FieldError errors={[{ message: formMessage }]} />
          ) : null}
          <Button
            type="submit"
            variant="default"
            className="self-start"
            isDisabled={isSubmitting}
          >
            Enviar
          </Button>
        </form>
      )}
    </Box>
  )
}
