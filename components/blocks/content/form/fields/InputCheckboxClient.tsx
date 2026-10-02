"use client"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { CheckboxBlock } from "@/types/blocks/form/fields/checkbox-block"

interface InputCheckboxClientProps {
  data: CheckboxBlock
  value: boolean
  onChange: (value: boolean) => void
  onBlur: () => void
  errors?: { message?: string }[]
}

export function InputCheckboxClient({
  data,
  value,
  onChange,
  onBlur,
  errors,
}: InputCheckboxClientProps) {
  const invalid = Boolean(errors?.some((error) => error?.message))
  return (
    <Field orientation="horizontal" data-invalid={invalid || undefined}>
      <Checkbox
        id={data.identifier}
        name={data.identifier}
        aria-label={data.label}
        isRequired={data.required}
        isSelected={value}
        isInvalid={invalid}
        onChange={onChange}
        onBlur={onBlur}
      />
      <FieldContent>
        <FieldLabel htmlFor={data.identifier}>
          {data.label}{" "}
          {data.required ? <span className="text-red-500">*</span> : null}
        </FieldLabel>
        <FieldError errors={errors} />
      </FieldContent>
    </Field>
  )
}
