"use client"

import { useAction } from "next-safe-action/hooks"
import { FormView } from "@/components/blocks/content/form/FormView"
import { submitForm } from "@/services/domain/server/form/submit-form"
import type { FormBlock } from "@/types/blocks/form/form-block"

export function FormClient({ data }: { data: FormBlock }) {
  const action = useAction(submitForm)
  const submitted = action.hasSucceeded && action.result.data.ok
  let formMessage: string | undefined
  let serverFieldErrors: Record<string, string> | undefined
  if (action.hasErrored) {
    formMessage =
      typeof action.result.serverError === "string"
        ? action.result.serverError
        : "No se pudo enviar el formulario."
  } else if (action.hasSucceeded && !action.result.data.ok) {
    formMessage = action.result.data.message
    serverFieldErrors = action.result.data.fieldErrors
  }

  return (
    <FormView
      data={data}
      isSubmitting={action.isExecuting}
      submitted={submitted}
      formMessage={formMessage}
      serverFieldErrors={serverFieldErrors}
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
