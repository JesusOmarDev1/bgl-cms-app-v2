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
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { updateProfile } from "@/services/domain/server/auth/profile"

interface ProfileValues {
  firstName: string
  lastName: string
  title: string
  location: string
  description: string
  tags: string
}

interface ProfileFormProps {
  identity: {
    firstName: string
    lastName: string
    title: string
    location: string
    description: string
    tags: string[]
  } | null
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
      // The action splits, dedupes and enforces 20 tags × 50 chars each.
      tags: pipe(
        string(),
        maxLength(1000, t("settings.textTooLong", { count: 1000 }))
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
      tags: identity?.tags.join(", ") ?? "",
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
        tags: value.tags,
      })
    },
  })

  if (!identity) return null

  return (
    <form
      className="flex max-w-sm flex-col gap-5"
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
          <label className="block space-y-3">
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
      <form.Field name="tags">
        {(field) => (
          <label className="block space-y-3">
            <span className="text-sm font-medium">
              {t("settings.profileTags")}
            </span>
            <InputGroup>
              <InputGroupInput
                type="text"
                placeholder={t("settings.tagsPlaceholder")}
                maxLength={1000}
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

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {te(error as "sessionExpired")}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-sm text-muted-foreground">
          {t("settings.profileSaved")}
        </p>
      ) : null}

      <Button className="self-start" type="submit" isDisabled={submitting}>
        {submitting ? (
          t("settings.profileSaving")
        ) : (
          <div className="flex items-center justify-center gap-1.5">
            <MaterialIcon
              name="save"
              data-icon="inline-start"
              className="text-accent"
            />
            <span>{t("settings.profileSave")}</span>
          </div>
        )}
      </Button>
    </form>
  )
}
