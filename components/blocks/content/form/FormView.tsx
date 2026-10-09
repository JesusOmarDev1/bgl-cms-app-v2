"use client"

import { useMemo, useState } from "react"
import { Turnstile } from "@marsidev/react-turnstile"
import { useForm, type StandardSchemaV1 } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { BarsRotateDots } from "@/assets/loaders/BarsRotateDots"
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
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Button } from "@/components/ui/button"
import { FieldError, FieldGroup } from "@/components/ui/field"
import {
  buildFormValuesSchema,
  expandedFormFields,
  type ExpandedFormField,
} from "@/lib/validations/form-values"
import type { FormBlock } from "@/types/blocks/form/form-block"
import type { FormResponseAnswer } from "@/types/collections/form-responses"

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

function defaultValue(row: ExpandedFormField): FormResponseAnswer[string] {
  switch (row.collection) {
    case "checkbox_block":
      return row.item.default === "true"
    case "number_block":
      return row.item.default
    case "date_block":
      return dateFieldDefault(row.item.default, row.item.hours)
    case "text_block":
    case "text_area_block":
    case "email_block":
    case "phone_block":
      return row.item.default ?? ""
  }
}

function defaultValues(rows: readonly ExpandedFormField[]): FormResponseAnswer {
  const values: FormResponseAnswer = {}
  for (const row of rows) {
    values[row.item.identifier] = defaultValue(row)
  }
  return values
}

function toFieldErrors(
  issues: readonly (string | { message?: string } | undefined)[],
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
  row,
  value,
  onChange,
  onBlur,
  errors,
}: {
  row: ExpandedFormField
  value: FormResponseAnswer[string]
  onChange: (value: FormResponseAnswer[string]) => void
  onBlur: () => void
  errors?: { message: string }[]
}) {
  switch (row.collection) {
    case "text_block":
      return (
        <InputTextClient
          data={row.item}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "text_area_block":
      return (
        <InputTextAreaClient
          data={row.item}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "email_block":
      return (
        <InputEmailClient
          data={row.item}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "phone_block":
      return (
        <InputPhoneClient
          data={row.item}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "number_block":
      return (
        <InputNumberClient
          data={row.item}
          value={typeof value === "number" ? value : null}
          onChange={onChange}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "date_block":
      return (
        <InputDateClient
          data={row.item}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          onBlur={onBlur}
          errors={errors}
        />
      )
    case "checkbox_block":
      return (
        <InputCheckboxClient
          data={row.item}
          value={value === true}
          onChange={onChange}
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
  onSubmit: (values: FormResponseAnswer, captchaToken: string) => void
  isSubmitting?: boolean
  submitted?: boolean
  formMessage?: string
  serverFieldErrors?: Record<string, string>
}) {
  const t = useTranslations("db.form_responses")
  const rows = useMemo(
    () =>
      expandedFormFields(data.fields).sort(
        (a, b) =>
          (a.sort ?? Number.MAX_SAFE_INTEGER) -
          (b.sort ?? Number.MAX_SAFE_INTEGER)
      ),
    [data.fields]
  )
  const values = useMemo(() => defaultValues(rows), [rows])
  const schema = useMemo(() => buildFormValuesSchema(rows), [rows])
  const [captcha, setCaptcha] = useState<{
    token: string
    message: string | undefined
  }>({ token: "", message: undefined })
  const captchaToken = captcha.message === formMessage ? captcha.token : ""
  const form = useForm({
    defaultValues: values,
    validators: {
      onSubmit: schema as StandardSchemaV1<FormResponseAnswer, unknown>,
    },
    onSubmit: ({ value }) => {
      onSubmit(value, captchaToken)
    },
  })

  return (
    <Box display="flex" orientation="vertical" gap={2}>
      <FormHeading data={data} />
      {submitted ? (
        <p role="status">{t("success")}</p>
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
                      row={row}
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
              onSuccess={(token) => setCaptcha({ token, message: formMessage })}
              onExpire={() => setCaptcha({ token: "", message: formMessage })}
              onError={() => setCaptcha({ token: "", message: formMessage })}
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
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <span aria-hidden className="size-5">
                <BarsRotateDots />
              </span>
            ) : null}
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </form>
      )}
    </Box>
  )
}
