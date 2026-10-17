"use client"

import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { FormView } from "@/components/blocks/content/form/FormView"
import { submitForm } from "@/services/domain/server/form/submit-form"
import type { FormBlockQuery } from "@/services/domain/db/queries/blocks/form-block/form-block.fields"

export function FormClient({ data }: { data: FormBlockQuery }) {
  const t = useTranslations("db.form_responses")
  const action = useAction(submitForm)
  const failure =
    action.result.data?.ok === false ? action.result.data : undefined

  return (
    <FormView
      data={data}
      isSubmitting={action.isExecuting}
      submitted={action.result.data?.ok === true}
      formMessage={
        action.hasErrored
          ? action.result.serverError || t("failed_to_submit")
          : failure?.message
      }
      serverFieldErrors={failure?.fieldErrors}
      onSubmit={(values, captchaToken) => {
        action.execute({
          formId: data.id,
          captchaToken: captchaToken || undefined,
          values,
        })
      }}
    />
  )
}
