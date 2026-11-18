"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useState } from "react"
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

/** Staggered entrance; the curve is `motionTokens.ease.enter`. */
const RISE =
  "motion-safe:animate-[auth-rise_.55s_cubic-bezier(.16,1,.3,1)_both]"

function AuthAside() {
  const t = useTranslations("auth")
  return (
    <div className="relative hidden h-full flex-col border-e bg-secondary p-10 lg:flex dark:bg-secondary/20">
      <StaticLogo className="absolute top-8 left-8 size-20" />
      <FloatingPaths position={1} />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
      <div className="relative z-10 mt-auto max-w-lg">
        <blockquote
          className={`${RISE} text-2xl leading-relaxed font-medium text-balance text-foreground/85`}
          style={{ animationDelay: "120ms" }}
        >
          “{t("asideQuote")}”
        </blockquote>
        <cite
          className={`${RISE} mt-4 block font-mono text-xs tracking-wide text-muted-foreground not-italic`}
          style={{ animationDelay: "200ms" }}
        >
          {t("asideAttribution")}
        </cite>
      </div>
    </div>
  )
}

interface StepProgressProps {
  current: number
  total: number
  title: string
  email: string
}

/** The stepper without its dot circles: one mono line from the password step on. */
function StepProgress({ current, total, title, email }: StepProgressProps) {
  const t = useTranslations("auth")
  return (
    <p className="flex items-center gap-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
      <span className="shrink-0">
        {t("stepProgress", { current, total, title })}
      </span>
      <span aria-hidden className="h-px flex-1 bg-border" />
      <span className="max-w-56 truncate text-xs tracking-normal text-foreground/75 normal-case">
        {email}
      </span>
    </p>
  )
}

/** Mount and bfcache restore both hand back a live, half-filled login form. */
function useResetOnEnter(reset: () => void) {
  useEffect(() => {
    reset()
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) reset()
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only reset
  }, [])
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
    // The widget exists only outside the email step; the epoch keys its remount.
    if (widgetMounted) setCaptchaEpoch((epoch) => epoch + 1)
  }

  // Logout returns here through the router cache and bfcache restores the page
  // as it was: a fresh login page never keeps the previous values, step, or a
  // spent captcha token.
  useResetOnEnter(() => {
    form.reset()
    setStep("email")
    freshChallenge()
  })

  // A manual step change drops the solved token: only the flow's own move
  // forward to the OTP step keeps it (the marker covers that one).
  function goToStep(next: Step) {
    setStep(next)
    freshChallenge()
    action.reset()
  }

  async function continueToPassword(event?: { preventDefault: () => void }) {
    event?.preventDefault()
    const errors = await form.validateField("email", "submit")
    if (errors.length === 0) goToStep("password")
  }

  function submitCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()
    void form.handleSubmit().catch(() => undefined)
  }

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <style href="auth-rise-keyframes" precedence="default">
        {
          "@keyframes auth-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}"
        }
      </style>
      <AuthAside />
      <div className="relative flex min-h-screen flex-col px-8 py-10">
        <Shaders />
        {/* One identity per zone: the aside owns the brand from lg up. */}
        <div className="relative flex">
          <LinkButton
            variant="ghost"
            href="/"
            className="text-muted-foreground"
          >
            <MaterialIcon name="chevron_left" data-icon="inline-start" />
            {t("backHome")}
          </LinkButton>
        </div>
        <div className="mx-auto my-auto w-full max-w-[420px] space-y-6">
          <StaticLogo className="size-24 lg:hidden" />
          <div
            className={`${RISE} space-y-1.5`}
            style={{ animationDelay: "40ms" }}
          >
            <div className="flex items-center gap-2.5">
              <MaterialIcon name="lock" size={28} />
              <h1 className="text-3xl font-bold tracking-tight">
                {t("signInTitle")}
              </h1>
            </div>
            <p className="text-base text-muted-foreground">
              {t("signInSubtitle")}
            </p>
          </div>

          <div
            className={`${RISE} space-y-5`}
            style={{ animationDelay: "120ms" }}
          >
            {step !== "email" ? (
              <form.Subscribe selector={(state) => state.values.email}>
                {(email) => (
                  <StepProgress
                    current={stepIndex + 1}
                    // Two-factor is optional: it only counts once the server asks.
                    total={step === "otp" ? 3 : 2}
                    title={stepTitles[step]}
                    email={email}
                  />
                )}
              </form.Subscribe>
            ) : null}

            <form
              className="space-y-5"
              aria-labelledby="login-step-title"
              onSubmit={
                step === "email" ? continueToPassword : submitCredentials
              }
              noValidate
            >
              <h2 id="login-step-title" className="sr-only">
                {stepTitles[step]}
              </h2>

              {step === "email" ? (
                <>
                  <form.Field
                    name="email"
                    validators={{ onBlur: emailSchema, onSubmit: emailSchema }}
                  >
                    {(field) => (
                      <label className="block space-y-2">
                        <span className="block text-sm font-medium text-muted-foreground">
                          {t("emailLabel")}
                        </span>
                        <InputGroup className="h-11 dark:bg-foreground/5 dark:hover:bg-foreground/[0.07]">
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
                    className="h-11 w-full"
                    type="button"
                    variant="red"
                    onClick={() => void continueToPassword()}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{t("continue")}</span>
                      <MaterialIcon
                        name="arrow_forward"
                        data-icon="inline-end"
                        className="text-white"
                      />
                    </div>
                  </Button>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t.rich("termsNote", {
                      terms: (chunks) => (
                        <Link
                          className="underline underline-offset-4 hover:text-foreground"
                          href="/legal/terminos-de-uso-y-datos"
                        >
                          {chunks}
                        </Link>
                      ),
                      privacy: (chunks) => (
                        <Link
                          className="underline underline-offset-4 hover:text-foreground"
                          href="/legal/politicas-de-privacidad"
                        >
                          {chunks}
                        </Link>
                      ),
                    })}
                  </p>
                </>
              ) : null}

              {step === "password" ? (
                <form.Field name="password">
                  {(field) => (
                    <label className="block space-y-2">
                      <span className="block text-sm font-medium text-muted-foreground">
                        {t("passwordLabel")}
                      </span>
                      <PasswordInput
                        className="h-11 dark:bg-foreground/5 dark:hover:bg-foreground/[0.07]"
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
                        className="h-11 w-full"
                        type="submit"
                        variant="red"
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
                              className="text-white"
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
                    variant="outline"
                    isDisabled={submitting}
                    onClick={() =>
                      goToStep(step === "otp" ? "password" : "email")
                    }
                  >
                    <MaterialIcon
                      name="arrow_back"
                      data-icon="inline-start"
                      className="text-foreground"
                    />
                    {t("back")}
                  </Button>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
