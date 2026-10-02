"use client"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { TextAreaBlock } from "@/types/blocks/form/fields/text-area-block"

interface InputTextAreaClientProps {
  data: TextAreaBlock
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
      <InputGroup>
        <InputGroupTextarea
          id={data.identifier}
          name={data.identifier}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`Ingresa tu ${data.label}`}
          rows={4}
          aria-invalid={invalid || undefined}
          maxLength={255}
          required={data.required}
          aria-label={data.label}
          autoComplete="off"
          inputMode="text"
          className="min-h-16 w-full resize-y"
        />
        <InputGroupAddon align="block-end">
          <InputGroupText className="tabular-nums">
            {value.length} / 255 caracteres
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <FieldError errors={errors} />
    </Field>
  )
}
