"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useTranslations } from "next-intl"
import { useForm, type StandardSchemaV1 } from "@tanstack/react-form"
import { maxLength, object, pipe, string } from "valibot"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import UploadAvatar from "@/components/shared/forms/UploadAvatar"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { updateProfile } from "@/services/domain/server/auth/profile"

interface ProfileValues {
  firstName: string
  lastName: string
  title: string
  location: string
  description: string
}

interface ProfileFormProps {
  identity: {
    firstName: string
    lastName: string
    title: string
    location: string
    description: string
    avatar: string | null
  } | null
}

function initialsOf(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?"
}

function serialize(values: ProfileValues) {
  return JSON.stringify({
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    title: values.title.trim(),
    location: values.location.trim(),
    description: values.description.trim(),
  })
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

export function ProfileForm({ identity }: ProfileFormProps) {
  const t = useTranslations("dashboard")
  const te = useTranslations("directusErrors")
  const router = useRouter()

  const initials = identity
    ? initialsOf(identity.firstName, identity.lastName)
    : "?"

  const action = useAction(updateProfile, {
    onSuccess: ({ data }) => {
      if (data?.ok) {
        router.refresh()
      }
    },
  })
  const result = action.result.data
  const submitting = action.isPending
  const error = result?.ok === false ? result.message : undefined
  const saved = result?.ok === true

  const profileSchema = pipe(
    object({
      firstName: pipe(
        string(),
        maxLength(80, t("settings.textTooLong", { count: 80 }))
      ),
      lastName: pipe(
        string(),
        maxLength(80, t("settings.textTooLong", { count: 80 }))
      ),
      title: pipe(
        string(),
        maxLength(80, t("settings.textTooLong", { count: 80 }))
      ),
      location: pipe(
        string(),
        maxLength(120, t("settings.textTooLong", { count: 120 }))
      ),
      description: pipe(
        string(),
        maxLength(500, t("settings.textTooLong", { count: 500 }))
      ),
    })
  )
  const form = useForm({
    defaultValues: {
      firstName: identity?.firstName ?? "",
      lastName: identity?.lastName ?? "",
      title: identity?.title ?? "",
      location: identity?.location ?? "",
      description: identity?.description ?? "",
    } as ProfileValues,
    validators: {
      onSubmit: profileSchema as StandardSchemaV1<ProfileValues, unknown>,
    },
    onSubmit: ({ value }) => {
      action.execute({
        firstName: value.firstName,
        lastName: value.lastName,
        title: value.title,
        location: value.location,
        description: value.description,
      })
    },
  })

  const initialSnapshot = identity
    ? serialize({
        firstName: identity.firstName,
        lastName: identity.lastName,
        title: identity.title,
        location: identity.location,
        description: identity.description,
      })
    : ""

  if (!identity) return null

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-3" aria-label={t("settings.photoLabel")}>
        <h3 className="text-sm font-medium">{t("settings.photoLabel")}</h3>
        <div className="flex items-center gap-4">
          {identity.avatar ? (
            <DirectusImage
              src={identity.avatar}
              variant="square"
              width={96}
              height={96}
              sizing="auto"
              alt={t("settings.photoLabel")}
              className="size-24 shrink-0 rounded-full"
              imgClassName="rounded-full"
            />
          ) : (
            <Avatar className="size-24 text-2xl">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          )}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("settings.photoHint")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("settings.photoRecommended")}
            </p>
          </div>
        </div>
        <UploadAvatar />
      </section>

      <form
        className="grid gap-5 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit().catch(() => undefined)
        }}
        noValidate
      >
        <form.Field name="firstName">
          {(field) => (
            <label className="block space-y-3">
              <span className="text-sm font-medium">
                {t("settings.profileFirstName")}
              </span>
              <InputGroup>
                <InputGroupInput
                  type="text"
                  autoComplete="given-name"
                  maxLength={80}
                  disabled={submitting}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              </InputGroup>
              {field.state.meta.errors.length > 0 ? (
                <FieldError errors={toFieldErrors(field.state.meta.errors)} />
              ) : null}
            </label>
          )}
        </form.Field>
        <form.Field name="lastName">
          {(field) => (
            <label className="block space-y-3">
              <span className="text-sm font-medium">
                {t("settings.profileLastName")}
              </span>
              <InputGroup>
                <InputGroupInput
                  type="text"
                  autoComplete="family-name"
                  maxLength={80}
                  disabled={submitting}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              </InputGroup>
              {field.state.meta.errors.length > 0 ? (
                <FieldError errors={toFieldErrors(field.state.meta.errors)} />
              ) : null}
            </label>
          )}
        </form.Field>
        <form.Field name="title">
          {(field) => (
            <label className="block space-y-3">
              <span className="text-sm font-medium">
                {t("settings.profileTitle")}
              </span>
              <InputGroup>
                <InputGroupInput
                  type="text"
                  maxLength={80}
                  disabled={submitting}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              </InputGroup>
              {field.state.meta.errors.length > 0 ? (
                <FieldError errors={toFieldErrors(field.state.meta.errors)} />
              ) : null}
            </label>
          )}
        </form.Field>

        <form.Field name="location">
          {(field) => (
            <label className="block space-y-3">
              <span className="text-sm font-medium">
                {t("settings.profileLocation")}
              </span>
              <InputGroup>
                <InputGroupInput
                  type="text"
                  placeholder={t("settings.locationPlaceholder")}
                  maxLength={120}
                  disabled={submitting}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              </InputGroup>
              {field.state.meta.errors.length > 0 ? (
                <FieldError errors={toFieldErrors(field.state.meta.errors)} />
              ) : null}
            </label>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <label className="block space-y-3 md:col-span-2">
              <span className="text-sm font-medium">
                {t("settings.profileDescription")}
              </span>
              <Textarea
                placeholder={t("settings.descriptionPlaceholder")}
                maxLength={500}
                disabled={submitting}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 ? (
                <FieldError errors={toFieldErrors(field.state.meta.errors)} />
              ) : null}
            </label>
          )}
        </form.Field>

        {error ? (
          <p role="alert" className="text-sm text-destructive md:col-span-2">
            {te(error as "sessionExpired")}
          </p>
        ) : null}
        {saved ? (
          <p
            role="status"
            className="text-sm text-muted-foreground md:col-span-2"
          >
            {t("settings.profileSaved")}
          </p>
        ) : null}

        <form.Subscribe
          selector={({ values }) => serialize(values as ProfileValues)}
        >
          {(snapshot) => {
            const dirty = snapshot !== initialSnapshot
            return (
              <Button
                className="md:col-span-2"
                type="submit"
                isDisabled={submitting || !dirty}
              >
                {submitting ? (
                  t("settings.profileSaving")
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <MaterialIcon
                      name="save"
                      data-icon="inline-start"
                      className="text-accent"
                    />
                    <span>
                      {dirty
                        ? t("settings.saveChanges")
                        : t("settings.noChanges")}
                    </span>
                  </div>
                )}
              </Button>
            )
          }}
        </form.Subscribe>
      </form>
    </div>
  )
}
