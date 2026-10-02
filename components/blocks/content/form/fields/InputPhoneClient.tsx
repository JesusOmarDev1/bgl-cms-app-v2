"use client"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { PhoneInput } from "@/components/shared/forms/PhoneInput"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { PhoneBlock } from "@/types/blocks/form/fields/phone-block"

interface InputPhoneClientProps {
  data: PhoneBlock
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  errors?: { message?: string }[]
}

export function InputPhoneClient({
  data,
  value,
  onChange,
  onBlur,
  errors,
}: InputPhoneClientProps) {
  const invalid = Boolean(errors?.some((error) => error?.message))
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={data.identifier}>
        {data.icon ? <MaterialIcon name={data.icon} /> : null}
        {data.label}{" "}
        {data.required ? <span className="text-red-500">*</span> : null}
      </FieldLabel>
      <PhoneInput
        id={data.identifier}
        name={data.identifier}
        aria-label={data.label}
        aria-invalid={invalid || undefined}
        required={data.required}
        defaultCountry="MX"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        className="w-full"
      />
      <FieldError errors={errors} />
    </Field>
  )
}
