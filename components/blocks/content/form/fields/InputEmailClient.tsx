"use client"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { EmailBlock } from "@/types/blocks/form/fields/email-block"

interface InputEmailClientProps {
  data: EmailBlock
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  errors?: { message?: string }[]
}

export function InputEmailClient({
  data,
  value,
  onChange,
  onBlur,
  errors,
}: InputEmailClientProps) {
  const invalid = Boolean(errors?.some((error) => error?.message))
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={data.identifier}>
        {data.icon ? <MaterialIcon name={data.icon} /> : null}
        {data.label}{" "}
        {data.required ? <span className="text-red-500">*</span> : null}
      </FieldLabel>
      <Input
        id={data.identifier}
        name={data.identifier}
        type="email"
        placeholder={`Ingresa tu ${data.label}`}
        inputMode="email"
        aria-label={data.label}
        aria-invalid={invalid || undefined}
        autoComplete="email"
        required={data.required}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError errors={errors} />
    </Field>
  )
}
