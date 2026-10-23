"use client"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import type { ExpandedFormField } from "@/lib/validations/form-values"

interface InputTextAreaClientProps {
  data: Extract<ExpandedFormField, { collection: "text_area_block" }>["item"]
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  errors?: { message?: string }[]
}

export function InputTextAreaClient({
  data,
  value,
  onChange,
  onBlur,
  errors,
}: InputTextAreaClientProps) {
  const invalid = Boolean(errors?.some((error) => error?.message))
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={data.identifier}>
        {data.icon ? <MaterialIcon name={data.icon} /> : null}
        {data.label}{" "}
        {data.required ? <span className="text-red-500">*</span> : null}
      </FieldLabel>
      <InputGroup className={invalid ? "t-input is-error" : undefined}>
        <InputGroupTextarea
          id={data.identifier}
          name={data.identifier}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`Ingresa tu ${data.label}...`}
          rows={5}
          aria-invalid={invalid || undefined}
          maxLength={500}
          required={data.required}
          aria-label={data.label}
          autoComplete="off"
          inputMode="text"
          className="min-h-20 w-full resize-y"
        />
        <InputGroupAddon align="block-end">
          <InputGroupText className="tabular-nums">
            {value.length} / 500 caracteres
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <FieldError className="t-error-msg" errors={errors} />
    </Field>
  )
}
