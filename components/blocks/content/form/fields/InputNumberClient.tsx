"use client"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ExpandedFormField } from "@/lib/validations/form-values"

interface InputNumberClientProps {
  data: Extract<ExpandedFormField, { collection: "number_block" }>["item"]
  value: number | null
  onChange: (value: number | null) => void
  onBlur: () => void
  errors?: { message?: string }[]
}

export function InputNumberClient({
  data,
  value,
  onChange,
  onBlur,
  errors,
}: InputNumberClientProps) {
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
        type="number"
        placeholder={`Ingresa tu ${data.label}`}
        inputMode="numeric"
        aria-label={data.label}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        required={data.required}
        min={data.min ?? undefined}
        max={data.max ?? undefined}
        value={value ?? ""}
        onBlur={onBlur}
        onChange={(event) => {
          if (event.target.value === "") {
            onChange(null)
            return
          }
          const next = event.target.valueAsNumber
          onChange(Number.isNaN(next) ? null : next)
        }}
        className={invalid ? "t-input is-error" : undefined}
      />
      <FieldError className="t-error-msg" errors={errors} />
    </Field>
  )
}
