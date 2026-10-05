"use client"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import {
  DatePicker,
  DatePickerContent,
  DatePickerTrigger,
} from "@/components/shared/forms/DatePicker"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatDateValue, parseDateString } from "@/lib/formatting/format-date"
import { DateBlock } from "@/types/blocks/form/fields/date-block"

interface InputDateClientProps {
  data: DateBlock
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  errors?: { message?: string }[]
}

export function dateFieldDefault(value: string | null, hours: boolean): string {
  if (!value) return ""
  const parsed = parseDateString(value)
  if (parsed) return formatDateValue(parsed, hours)
  return formatDateValue(new Date(value), hours)
}

export function InputDateClient({
  data,
  value,
  onChange,
  onBlur,
  errors,
}: InputDateClientProps) {
  const invalid = Boolean(errors?.some((error) => error?.message))
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={data.identifier}>
        {data.icon ? <MaterialIcon name={data.icon} /> : null}
        {data.label}{" "}
        {data.required ? <span className="text-red-500">*</span> : null}
      </FieldLabel>
      {data.hours ? (
        <Input
          id={data.identifier}
          name={data.identifier}
          type="datetime-local"
          aria-label={data.label}
          aria-invalid={invalid || undefined}
          required={data.required}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <DatePicker
          value={parseDateString(value) ?? null}
          onValueChange={(date) =>
            onChange(date ? formatDateValue(date, false) : "")
          }
          className="w-full"
        >
          <DatePickerTrigger
            id={data.identifier}
            aria-label={data.label}
            aria-invalid={invalid || undefined}
            placeholder="Selecciona una fecha"
            locale="es-ES"
            onBlur={onBlur}
          />
          <DatePickerContent />
        </DatePicker>
      )}
      <FieldError errors={errors} />
    </Field>
  )
}
