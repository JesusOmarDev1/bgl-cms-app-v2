"use client"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import {
  DatePicker,
  DatePickerContent,
  DatePickerTrigger,
} from "@/components/shared/forms/DatePicker"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { DateBlock } from "@/types/blocks/form/fields/date-block"

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
const LOCAL_DATE_TIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/

interface InputDateClientProps {
  data: DateBlock
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  errors?: { message?: string }[]
}

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function formatDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatDateTimeLocal(date: Date): string {
  return `${formatDateOnly(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY.exec(value)
  if (!match?.[1] || !match[2] || !match[3]) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export function dateFieldDefault(value: string | null, hours: boolean): string {
  if (!value) return ""
  const dateOnly = DATE_ONLY.exec(value)
  if (dateOnly?.[1] && dateOnly[2] && dateOnly[3]) {
    const day = `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`
    return hours ? `${day}T00:00` : day
  }
  const zoned = value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value)
  if (zoned) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return hours ? formatDateTimeLocal(date) : formatDateOnly(date)
  }
  const local = LOCAL_DATE_TIME.exec(value)
  if (local?.[1] && local[2]) {
    return hours ? `${local[1]}T${local[2]}` : local[1]
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return hours ? formatDateTimeLocal(date) : formatDateOnly(date)
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
          value={parseDateOnly(value)}
          onValueChange={(date) => onChange(date ? formatDateOnly(date) : "")}
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
