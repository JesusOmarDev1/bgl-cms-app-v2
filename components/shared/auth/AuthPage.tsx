"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { Turnstile } from "@marsidev/react-turnstile"
import { useForm, type StandardSchemaV1 } from "@tanstack/react-form"
import { email, nonEmpty, object, pipe, string } from "valibot"
import { Button, LinkButton } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { PasswordInput } from "@/components/shared/forms/PasswordInput"
import { FloatingPaths } from "@/components/shared/animation/FloatingPaths"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { StaticLogo } from "@/assets/logos/static-logo"
import { login } from "@/services/domain/server/auth/login"
import {
  TURNSTILE_LOGIN_ACTION,
  TURNSTILE_SITE_KEY as turnstileSiteKey,
} from "@/lib/env/constants"
import { OtpField } from "@/components/shared/auth/OtpInput"
import { Shaders } from "@/components/shared/auth/Shaders"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper"

/** Login flow order: one Turnstile challenge outside the steps, one submission per step. */
const STEPS = ["email", "password", "otp"] as const
type Step = (typeof STEPS)[number]

/** Auth-level error keys; the rest come from the directusErrors catalog. */
const AUTH_ERROR_KEYS = [
  "invalidCredentials",
  "mfaRequired",
  "mfaInvalid",
  "noRole",
  "turnstileFailed",
]

interface ErrorAlertProps {
  error: string
}

interface LoginValues {
  email: string
  password: string
  otp: string
  captcha: string
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

interface AuthPageProps {
  captchaEnabled?: boolean
}

function AuthAside() {
  const t = useTranslations("auth")
  return (
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
  )
}

interface StepRailProps {
  activeIndex: number
  titles: Record<Step, string>
  onSelect: (index: number) => void
}

function StepRail({ activeIndex, titles, onSelect }: StepRailProps) {
  return (
    <Stepper
      value={activeIndex + 1}
      onValueChange={(index) => {
        // The rail only walks back; forward progress belongs to the flow.
        if (index <= activeIndex) onSelect(index)
      }}
      className="py-1"
    >
      <StepperNav className="items-center gap-1">
        {STEPS.map((value, index) => (
          <StepperItem
            key={value}
            step={index + 1}
            disabled={index > activeIndex}
            className="flex-1 justify-start"
          >
            <StepperTrigger>
              <StepperIndicator>{index + 1}</StepperIndicator>
              <span className="sr-only">{titles[value]}</span>
            </StepperTrigger>
            {index < STEPS.length - 1 ? <StepperSeparator /> : null}
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  )
}

export function AuthPage({ captchaEnabled = false }: AuthPageProps) {
  const t = useTranslations("auth")
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [captchaEpoch, setCaptchaEpoch] = useState(0)
  const action = useAction(login, {
    onSuccess: ({ data }) => {
      if (data?.ok) {
        router.refresh()
        router.push("/dashboard")
        return
      }
      // The signed server marker covers the OTP retry, so only a failure that
      // spent the token without a marker remounts the widget for a new one.
      if (data?.mfaRequired) setStep("otp")
      else freshChallenge()
    },
  })
  const result = action.result.data
  const submitting = action.isPending
  const error = result?.ok === false ? result.message : undefined
  const stepIndex = STEPS.indexOf(step)
  const stepTitles: Record<Step, string> = {
    email: t("emailStepTitle"),
    password: t("passwordStepTitle"),
    otp: t("otpStepTitle"),
  }
  // captchaEnabled comes from the server: it is true only when both the
  // siteKey and the secret exist. A secret without a siteKey mounts no widget,
  // and the server rejects every attempt with turnstileFailed.
  const widgetMounted = captchaEnabled && turnstileSiteKey !== ""

  const emailSchema = pipe(
    string(),
    nonEmpty(t("emailRequired")),
    email(t("emailInvalid"))
  )
  const loginSchema = pipe(
    object({
      email: emailSchema,
      password: pipe(string(), nonEmpty(t("passwordRequired"))),
      otp: string(),
      captcha: string(),
    })
  )
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      otp: "",
      captcha: "",
    } as LoginValues,
    validators: {
      onSubmit: loginSchema as StandardSchemaV1<LoginValues, unknown>,
    },
    onSubmit: ({ value }) => {
      // A Turnstile token is single use: it leaves the form as it is sent, so the
      // OTP step rides on the server marker and only a refreshed token travels.
      const captcha = value.captcha || undefined
      if (captcha) form.setFieldValue("captcha", "")
      action.execute({
        email: value.email,
        password: value.password,
        otp: step === "otp" ? value.otp.trim() || undefined : undefined,
        captcha,
      })
    },
  })

  function freshChallenge() {
    form.setFieldValue("captcha", "")
    setCaptchaEpoch((epoch) => epoch + 1)
  }

  // A manual step change drops the solved token: only the flow's own move
  // forward to the OTP step keeps it (the marker covers that one).
  function goToStep(next: Step) {
    setStep(next)
    freshChallenge()
    action.reset()
  }

  async function continueToPassword() {
    const errors = await form.validateField("email", "submit")
    if (errors.length === 0) goToStep("password")
  }

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <AuthAside />
      <div className="relative flex min-h-screen flex-col justify-center px-8">
        <Shaders />
        <div className="mx-auto w-full max-w-sm space-y-4 sm:w-sm">
          {/* One identity per zone: the aside owns the brand from lg up. */}
          <div className="flex">
            <LinkButton variant="ghost" href="/">
              <MaterialIcon name="chevron_left" data-icon="inline-start" />
              {t("backHome")}
            </LinkButton>
          </div>
          <StaticLogo className="size-24 lg:hidden" />
          <div className="flex flex-col space-y-1">
            <h1 className="text-4xl font-bold tracking-wide">
              {t("signInTitle")}
            </h1>
            <p className="text-base text-muted-foreground">
              {t("signInSubtitle")}
            </p>
          </div>

          <StepRail
            activeIndex={stepIndex}
            titles={stepTitles}
            onSelect={(index) => goToStep(STEPS[index - 1])}
          />

          <form
            className="space-y-4"
            aria-labelledby="login-step-title"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit().catch(() => undefined)
            }}
            noValidate
          >
            <h2 id="login-step-title" className="text-xl font-semibold">
              {stepTitles[step]}
            </h2>

            {step === "email" ? (
              <>
                <form.Field
                  name="email"
                  validators={{ onBlur: emailSchema, onSubmit: emailSchema }}
                >
                  {(field) => (
                    <label className="block space-y-3">
                      <span className="sr-only">{t("emailLabel")}</span>
                      <InputGroup>
                        <InputGroupInput
                          type="email"
                          autoComplete="email"
                          required
                          autoFocus
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
                <Button
                  className="w-full"
                  type="button"
                  onClick={() => void continueToPassword()}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>{t("continue")}</span>
                    <MaterialIcon name="arrow_forward" data-icon="inline-end" />
                  </div>
                </Button>
              </>
            ) : null}

            {step === "password" ? (
              <form.Field name="password">
                {(field) => (
                  <label className="block space-y-3">
                    <span className="sr-only">{t("passwordLabel")}</span>
                    <PasswordInput
                      autoComplete="current-password"
                      placeholder={t("passwordPlaceholder")}
                      required
                      autoFocus
                      disabled={submitting}
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
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
            ) : null}

            {step === "otp" ? (
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

            {step !== "email" && widgetMounted ? (
              <div className="min-h-[65px] w-full">
                <Turnstile
                  key={captchaEpoch}
                  className="w-full"
                  siteKey={turnstileSiteKey}
                  options={{
                    theme: "dark",
                    language: "es",
                    action: TURNSTILE_LOGIN_ACTION,
                    size: "flexible",
                  }}
                  onSuccess={(token) => form.setFieldValue("captcha", token)}
                  onExpire={() => form.setFieldValue("captcha", "")}
                  onError={() => form.setFieldValue("captcha", "")}
                />
              </div>
            ) : null}

            {step !== "email" ? (
              <div className="space-y-2">
                <form.Subscribe selector={(state) => state.values.captcha}>
                  {(captcha) => (
                    <Button
                      className="w-full"
                      type="submit"
                      isDisabled={
                        submitting ||
                        (widgetMounted && step === "password" && !captcha)
                      }
                    >
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
                  )}
                </form.Subscribe>
                <Button
                  className="w-full"
                  type="button"
                  variant="ghost"
                  isDisabled={submitting}
                  onClick={() =>
                    goToStep(step === "otp" ? "password" : "email")
                  }
                >
                  <MaterialIcon name="arrow_back" data-icon="inline-start" />
                  {t("back")}
                </Button>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  )
}
