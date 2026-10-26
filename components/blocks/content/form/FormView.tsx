"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { Turnstile } from "@marsidev/react-turnstile"
import { useForm, type StandardSchemaV1 } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { BarsRotateDots } from "@/assets/loaders/BarsRotateDots"
import { FormState } from "@/components/blocks/content/form/FormState"
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
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Button } from "@/components/ui/button"
import { FieldError, FieldGroup } from "@/components/ui/field"
import {
  TURNSTILE_FORM_ACTION,
  TURNSTILE_SITE_KEY as turnstileSiteKey,
} from "@/lib/env/constants"
import {
  buildFormValuesSchema,
  FORM_VALUE_MAX_LENGTH,
  type ExpandedFormField,
} from "@/lib/validations/form-values"
import type { FormBlockQuery } from "@/services/domain/db/queries/blocks/form-block/form-block.fields"
import type { FormResponseAnswer } from "@/types/collections/form-responses"

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

function FormHeading({ data }: { data: FormBlockQuery }) {
  return (
    <Box display="flex" orientation="vertical" gap={1}>
      <h2
        id={`${data.id}-title`}
        className="flex items-center gap-2 text-2xl font-semibold lg:text-4xl"
      >
        {data.icon ? (
          <MaterialIcon
            className="text-muted-foreground"
            name={data.icon}
            size={24}
          />
        ) : null}
        {data.title}
      </h2>
      <SafeHtml
        content={data.excerpt ?? undefined}
        className="text-muted-foreground"
      />
    </Box>
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
  data: FormBlockQuery
  onSubmit: (values: FormResponseAnswer, captchaToken: string) => void
  isSubmitting?: boolean
  submitted?: boolean
  formMessage?: string
  serverFieldErrors?: Record<string, string>
}) {
  const t = useTranslations("db.form_responses")
  const rows = useMemo(
    () =>
      [...data.fields].sort(
        (a, b) =>
          (a.sort ?? Number.MAX_SAFE_INTEGER) -
          (b.sort ?? Number.MAX_SAFE_INTEGER)
      ),
    [data.fields]
  )
  const values = useMemo(() => defaultValues(rows), [rows])
  const schema = useMemo(
    () =>
      buildFormValuesSchema(rows, {
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
    [rows, t]
  )
  const [captcha, setCaptcha] = useState<{
    token: string
    message: string | undefined
  }>({ token: "", message: undefined })
  const captchaToken = captcha.message === formMessage ? captcha.token : ""
  const formRef = useRef<HTMLFormElement>(null)
  const [shakeTick, setShakeTick] = useState(0)
  const form = useForm({
    defaultValues: values,
    validators: {
      onSubmit: schema as StandardSchemaV1<FormResponseAnswer, unknown>,
    },
    onSubmit: ({ value }) => {
      onSubmit(value, captchaToken)
    },
  })

  useEffect(() => {
    const root = formRef.current
    if (!root) return
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(".t-input.is-error")
    )
    if (nodes.length === 0) return

    const styles = getComputedStyle(document.documentElement)
    const ms = (name: string, fallback: number) => {
      const value = Number.parseFloat(styles.getPropertyValue(name))
      return Number.isFinite(value) ? value : fallback
    }
    const shakeMs = ms("--shake-dur-a", 80) * 2 + ms("--shake-dur-b", 60) * 2

    for (const node of nodes) {
      node.classList.remove("is-shaking")
      void node.offsetWidth
      node.classList.add("is-shaking")
    }

    const timer = window.setTimeout(() => {
      for (const node of nodes) node.classList.remove("is-shaking")
    }, shakeMs + 20)

    return () => window.clearTimeout(timer)
  }, [shakeTick, serverFieldErrors])

  const queueSubmit = () => {
    // Previous form-level issues stay on the fields and block the next schema
    // run. Clear them so this submit validates again.
    for (const row of rows) {
      form.setFieldMeta(row.item.identifier, (prev) => ({
        ...prev,
        errorMap: {
          ...prev.errorMap,
          onSubmit: undefined,
        },
      }))
    }
    void form
      .handleSubmit()
      .catch(() => undefined)
      .finally(() => {
        setShakeTick((tick) => tick + 1)
      })
  }

  return (
    <BoxContainer>
      <Box display="flex" orientation="vertical" gap={2}>
        {submitted ? (
          <FormState message={t("success")} />
        ) : (
          <Fragment>
            <FormHeading data={data} />
            <form
              ref={formRef}
              aria-labelledby={`${data.id}-title`}
              className="flex w-full flex-col gap-4"
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                queueSubmit()
              }}
            >
              <FieldGroup className="flex-row flex-wrap items-start gap-x-0 gap-y-5">
                {rows.map((row) => (
                  <form.Field key={row.id} name={row.item.identifier}>
                    {(field) => {
                      const errors = toFieldErrors(
                        field.state.meta.errors,
                        serverFieldErrors?.[row.item.identifier]
                      )
                      return (
                        <div
                          className={
                            errors
                              ? "t-input-wrap is-error box-border w-full min-w-0 px-1 @3xl/field-group:w-(--field-width)"
                              : "t-input-wrap box-border w-full min-w-0 px-1 @3xl/field-group:w-(--field-width)"
                          }
                          style={{
                            ["--field-width" as string]: `${row.item.width}%`,
                          }}
                        >
                          <FieldControl
                            row={row}
                            value={field.state.value}
                            onChange={(next) => field.handleChange(next)}
                            onBlur={field.handleBlur}
                            errors={errors}
                          />
                        </div>
                      )
                    }}
                  </form.Field>
                ))}
              </FieldGroup>
              {data.captcha && turnstileSiteKey ? (
                <Turnstile
                  key={formMessage ?? "idle"}
                  siteKey={turnstileSiteKey}
                  options={{
                    theme: "dark",
                    language: "es",
                    action: TURNSTILE_FORM_ACTION,
                  }}
                  onSuccess={(token) =>
                    setCaptcha({ token, message: formMessage })
                  }
                  onExpire={() =>
                    setCaptcha({ token: "", message: formMessage })
                  }
                  onError={() =>
                    setCaptcha({ token: "", message: formMessage })
                  }
                />
              ) : null}
              {formMessage ? (
                <FieldError errors={[{ message: formMessage }]} />
              ) : null}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="default"
                  className="self-start"
                  isDisabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {!isSubmitting && !submitted ? (
                    <MaterialIcon name="send" className="text-accent" />
                  ) : null}
                  {isSubmitting ? (
                    <span aria-hidden className="size-5">
                      <BarsRotateDots />
                    </span>
                  ) : null}
                  {isSubmitting ? t("submitting") : t("submit")}
                </Button>
                <Button
                  type="reset"
                  variant="outline"
                  className="self-start"
                  isDisabled={isSubmitting}
                  aria-busy={isSubmitting}
                  onClick={() => {
                    form.reset()
                  }}
                >
                  <MaterialIcon name="mop" className="text-primary" />
                  {t("reset")}
                </Button>
              </div>
            </form>
          </Fragment>
        )}
      </Box>
    </BoxContainer>
  )
}
