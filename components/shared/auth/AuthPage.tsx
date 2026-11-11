"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useForm, type StandardSchemaV1 } from "@tanstack/react-form"
import { email, nonEmpty, object, pipe, string } from "valibot"
import { Button, LinkButton } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { PasswordInput } from "@/components/shared/forms/PasswordInput"
import { FloatingPaths } from "@/components/shared/animation/FloatingPaths"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { StaticLogo } from "@/assets/logos/static-logo"
import { login } from "@/services/domain/server/auth/login"
import { OtpField } from "@/components/shared/auth/OtpInput"
import { Shaders } from "@/components/shared/auth/Shaders"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

/** Auth-level error keys; the rest come from the directusErrors catalog. */
const AUTH_ERROR_KEYS = [
  "invalidCredentials",
  "mfaRequired",
  "mfaInvalid",
  "noRole",
]

interface ErrorAlertProps {
  error: string
}

interface LoginValues {
  email: string
  password: string
  otp: string
}

function toFieldErrors(
  issues: readonly (string | { message?: string } | undefined)[]
): { message: string }[] | undefined {
  const errors: { message: string }[] = []
  for (const issue of issues) {
    if (typeof issue === "string") {
      if (issue) errors.push({ message: issue })
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
  return errors.length > 0 ? errors : undefined
}

function ErrorAlert({ error }: ErrorAlertProps) {
  const t = useTranslations("auth")
  const te = useTranslations("directusErrors")
  const authKey = AUTH_ERROR_KEYS.includes(error)
  return (
    <p role="alert" className="text-sm text-destructive">
      {authKey ? t(error as "invalidCredentials") : te(error as "generic")}
    </p>
  )
}

export function AuthPage() {
  const t = useTranslations("auth")
  const router = useRouter()
  const action = useAction(login, {
    onSuccess: ({ data }) => {
      if (data?.ok) {
        router.refresh()
        router.push("/dashboard")
      }
    },
  })
  const result = action.result.data
  const submitting = action.isPending
  const error = result?.ok === false ? result.message : undefined
  const otpRequired = result?.ok === false && result.mfaRequired === true

  const loginSchema = pipe(
    object({
      email: pipe(
        string(),
        nonEmpty(t("emailRequired")),
        email(t("emailInvalid"))
      ),
      password: pipe(string(), nonEmpty(t("passwordRequired"))),
      otp: string(),
    })
  )
  const form = useForm({
    defaultValues: { email: "", password: "", otp: "" } as LoginValues,
    validators: {
      onSubmit: loginSchema as StandardSchemaV1<LoginValues, unknown>,
    },
    onSubmit: ({ value }) => {
      action.execute({
        email: value.email,
        password: value.password,
        otp: otpRequired ? value.otp.trim() || undefined : undefined,
      })
    },
  })

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col border-e bg-secondary p-10 lg:flex dark:bg-secondary/20">
        <StaticLogo className="absolute top-8 left-8 size-20" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        <div className="z-10 mt-auto">
          <blockquote className="space-y-2 text-lg text-foreground/80">
            {t("brandNarrative")}
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>
      <div className="relative flex min-h-screen flex-col justify-center px-8">
        <Shaders />
        <LinkButton className="absolute start-5 top-7" variant="ghost" href="/">
          <MaterialIcon name="chevron_left" data-icon="inline-start" />
          {t("backHome")}
        </LinkButton>

        <div className="mx-auto w-full max-w-sm space-y-4 sm:w-sm">
          <StaticLogo className="size-24" />
          <div className="flex flex-col space-y-1">
            <h1 className="text-4xl font-bold tracking-wide">
              {t("signInTitle")}
            </h1>
            <p className="text-base text-muted-foreground">
              {t("signInSubtitle")}
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit().catch(() => undefined)
            }}
            noValidate
          >
            <form.Field name="email">
              {(field) => (
                <label className="block space-y-3">
                  <span className="text-sm font-medium">{t("emailLabel")}</span>
                  <InputGroup>
                    <InputGroupInput
                      type="email"
                      autoComplete="email"
                      required
                      disabled={submitting}
                      placeholder={t("emailPlaceholder")}
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                    />
                    <InputGroupAddon align="inline-start">
                      <MaterialIcon name="email" />
                    </InputGroupAddon>
                  </InputGroup>
                  {field.state.meta.errors.length > 0 ? (
                    <FieldError
                      errors={toFieldErrors(field.state.meta.errors)}
                    />
                  ) : null}
                </label>
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <label className="block space-y-3">
                  <span className="text-sm font-medium">
                    {t("passwordLabel")}
                  </span>
                  <PasswordInput
                    autoComplete="current-password"
                    placeholder={t("passwordPlaceholder")}
                    required
                    disabled={submitting}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <FieldError
                      errors={toFieldErrors(field.state.meta.errors)}
                    />
                  ) : null}
                </label>
              )}
            </form.Field>
            {otpRequired ? (
              <form.Field name="otp">
                {(field) => (
                  <OtpField
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    submitting={submitting}
                  />
                )}
              </form.Field>
            ) : null}

            {error ? <ErrorAlert error={error} /> : null}

            <Button className="w-full" type="submit" isDisabled={submitting}>
              {submitting ? (
                t("signingIn")
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <MaterialIcon
                    name="login"
                    data-icon="inline-start"
                    className="text-accent"
                  />
                  <span>{t("signIn")}</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
