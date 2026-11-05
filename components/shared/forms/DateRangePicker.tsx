"use client"

import * as React from "react"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Button } from "@/components/ui/button"
import { Popover } from "@/components/ui/popover"
import { cn } from "cn"
import {
  clampDate,
  gridKeyToDate,
  monthCells,
  monthIndex,
  sameDay,
  startOfDay,
} from "@/lib/animation/forms/calendar/calendar-utils"

const DEFAULT_LOCALE = "es-ES"
const TIME_ZONE = "America/Mexico_City"

type DateRangeSelection = { mode: "range"; start: Date; end: Date | null }
type SpecificDaysSelection = { mode: "days"; days: Date[] }
export type DateRangePickerValue = DateRangeSelection | SpecificDaysSelection
export type DateRangePickerMode = DateRangePickerValue["mode"]

type DateRangePickerProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> & {
  value?: DateRangePickerValue | null
  defaultValue?: DateRangePickerValue | null
  onValueChange?: (value: DateRangePickerValue | null) => void
  defaultMonth?: Date
  min?: Date
  max?: Date
  disabledDate?: (date: Date) => boolean
  locale?: string
  weekStartsOn?: 0 | 1
  disabled?: boolean
  placeholder?: string
}

function calendarDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function DateRangePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  defaultMonth,
  min,
  max,
  disabledDate,
  locale = DEFAULT_LOCALE,
  weekStartsOn = 1,
  disabled,
  placeholder = "Selecciona fechas",
  className,
  ...props
}: DateRangePickerProps) {
  const [internalValue, setInternalValue] =
    React.useState<DateRangePickerValue | null>(defaultValue)
  const value = valueProp !== undefined ? valueProp : internalValue
  const [mode, setMode] = React.useState<DateRangePickerMode>(
    value?.mode ?? "range"
  )
  const [previousValueMode, setPreviousValueMode] = React.useState(value?.mode)
  if (value?.mode && value.mode !== previousValueMode) {
    setMode(value.mode)
    setPreviousValueMode(value.mode)
  }
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState(() => {
    const anchor =
      defaultMonth ??
      (value?.mode === "range" ? value.start : value?.days[0]) ??
      new Date()
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  })
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)

  const setValue = (next: DateRangePickerValue | null) => {
    if (valueProp === undefined) setInternalValue(next)
    onValueChange?.(next)
  }
  const isDisabled = React.useCallback(
    (date: Date) => {
      if (min && date.getTime() < startOfDay(min).getTime()) return true
      if (max && date.getTime() > startOfDay(max).getTime()) return true
      return disabledDate?.(date) ?? false
    },
    [min, max, disabledDate]
  )
  const viewMonth = month
  const days = monthCells(viewMonth, weekStartsOn)
  const firstEnabledDay = days.find(
    (day): day is Date => day !== null && !isDisabled(day)
  )
  const weeks: (Date | null)[][] = []
  for (let index = 0; index < days.length; index += 7)
    weeks.push(days.slice(index, index + 7))

  const selected = (date: Date) => {
    if (mode === "days" && value?.mode === "days")
      return value.days.some((selectedDate) => sameDay(selectedDate, date))
    if (mode === "range" && value?.mode === "range") {
      return (
        date.getTime() >= startOfDay(value.start).getTime() &&
        (!value.end || date.getTime() <= startOfDay(value.end).getTime())
      )
    }
    return false
  }
  const rangeEndpoint = (date: Date) =>
    mode === "range" &&
    value?.mode === "range" &&
    (sameDay(value.start, date) || sameDay(value.end, date))

  const selectDate = (date: Date) => {
    const day = calendarDay(date)
    if (mode === "days") {
      const current = value?.mode === "days" ? value.days : []
      const next = current.some((item) => sameDay(item, day))
        ? current.filter((item) => !sameDay(item, day))
        : [...current, day].sort((a, b) => a.getTime() - b.getTime())
      setValue(next.length ? { mode: "days", days: next } : null)
      return
    }

    if (value?.mode !== "range" || value.end) {
      setValue({ mode: "range", start: day, end: null })
    } else if (day.getTime() < startOfDay(value.start).getTime()) {
      setValue({ mode: "range", start: day, end: null })
    } else {
      setValue({ mode: "range", start: calendarDay(value.start), end: day })
    }
  }

  const changeMode = (next: DateRangePickerMode) => {
    if (next === mode) return
    setMode(next)
    setValue(null)
  }
  const moveFocus = (date: Date) => {
    const target = clampDate(date, min, max)
    if (monthIndex(target) !== monthIndex(viewMonth)) {
      setMonth(new Date(target.getFullYear(), target.getMonth(), 1))
      requestAnimationFrame(() =>
        rootRef.current
          ?.querySelector<HTMLButtonElement>(`[data-day="${target.getTime()}"]`)
          ?.focus()
      )
    } else {
      rootRef.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${target.getTime()}"]`)
        ?.focus()
    }
  }
  const handleDayKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    day: Date
  ) => {
    const forward =
      getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1
    const next = gridKeyToDate(event.key, day, {
      weekStartsOn,
      shiftKey: event.shiftKey,
      forward,
    })
    if (!next) return
    event.preventDefault()
    moveFocus(next)
  }

  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeZone: TIME_ZONE,
      }),
    [locale]
  )
  const dayLabelFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeZone: TIME_ZONE,
      }),
    [locale]
  )
  const formatDay = (date: Date, formatter: Intl.DateTimeFormat) =>
    formatter.format(
      new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    )
  const weekdayFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        timeZone: TIME_ZONE,
      }),
    [locale]
  )
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    weekdayFormatter.format(
      new Date(Date.UTC(2021, 7, 1 + ((weekStartsOn + index) % 7)))
    )
  )
  const monthFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
        timeZone: TIME_ZONE,
      }),
    [locale]
  )
  const monthCaption = monthFormatter.format(
    new Date(Date.UTC(viewMonth.getFullYear(), viewMonth.getMonth(), 1))
  )
  const label =
    value?.mode === "range"
      ? `${formatDay(value.start, dateFormatter)}${value.end ? ` – ${formatDay(value.end, dateFormatter)}` : ""}`
      : value?.mode === "days"
        ? `${value.days.length} días seleccionados`
        : placeholder

  return (
    <div ref={rootRef} className={cn("inline-flex", className)} {...props}>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        isDisabled={disabled}
        aria-label={value ? `Fechas seleccionadas: ${label}` : placeholder}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-slot="date-range-picker-trigger"
        onPress={() => setOpen((previous) => !previous)}
        className="h-9 w-full justify-start gap-2 px-3 text-start text-sm font-normal tabular-nums"
      >
        <MaterialIcon name="calendar_today" size={14} className="shrink-0" />
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {label}
        </span>
      </Button>
      <Popover
        triggerRef={triggerRef}
        isOpen={open}
        onOpenChange={setOpen}
        className="w-auto"
        data-slot="date-range-picker-popover"
      >
        <div className="w-64 p-3">
          <div
            className="mb-3 grid grid-cols-2 gap-1"
            role="group"
            aria-label="Modo de selección"
          >
            <Button
              type="button"
              variant={mode === "range" ? "secondary" : "ghost"}
              size="sm"
              data-mode="range"
              aria-pressed={mode === "range"}
              onPress={() => changeMode("range")}
            >
              Período
            </Button>
            <Button
              type="button"
              variant={mode === "days" ? "secondary" : "ghost"}
              size="sm"
              data-mode="days"
              aria-pressed={mode === "days"}
              onPress={() => changeMode("days")}
            >
              Días específicos
            </Button>
          </div>
          <div
            data-slot="date-range-picker-calendar-header"
            className="mb-2 flex items-center justify-between"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Previous month"
              isDisabled={
                !!min &&
                new Date(
                  viewMonth.getFullYear(),
                  viewMonth.getMonth(),
                  0
                ).getTime() < startOfDay(min).getTime()
              }
              onPress={() =>
                setMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
                )
              }
            >
              <MaterialIcon name="chevron_left" size={14} />
            </Button>
            <span className="text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
              {monthCaption}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Next month"
              isDisabled={
                !!max &&
                new Date(
                  viewMonth.getFullYear(),
                  viewMonth.getMonth() + 1,
                  1
                ).getTime() > startOfDay(max).getTime()
              }
              onPress={() =>
                setMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
                )
              }
            >
              <MaterialIcon name="chevron_right" size={14} />
            </Button>
          </div>
          <div role="grid" aria-label={monthCaption} className="grid gap-y-0.5">
            <div role="row" className="grid grid-cols-7">
              {weekdays.map((weekday) => (
                <span
                  key={weekday}
                  role="columnheader"
                  className="flex h-7 items-center justify-center text-[10px] text-muted-foreground uppercase"
                >
                  {weekday}
                </span>
              ))}
            </div>
            {weeks.map((week, weekIndex) => (
              <div
                key={week.find(Boolean)?.getTime() ?? weekIndex}
                role="row"
                className="grid grid-cols-7"
              >
                {week.map((day, dayIndex) =>
                  day ? (
                    <button
                      key={day.getTime()}
                      type="button"
                      role="gridcell"
                      data-day={day.getTime()}
                      aria-label={formatDay(day, dayLabelFormatter)}
                      aria-selected={selected(day)}
                      disabled={isDisabled(day)}
                      tabIndex={day === firstEnabledDay ? 0 : -1}
                      onClick={() => selectDate(day)}
                      onKeyDown={(event) => handleDayKeyDown(event, day)}
                      className={cn(
                        "relative size-8 rounded-sm text-xs tabular-nums transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30",
                        selected(day) &&
                          "bg-primary text-primary-foreground hover:bg-primary",
                        rangeEndpoint(day) && "rounded-full"
                      )}
                    >
                      {day.getDate()}
                    </button>
                  ) : (
                    <span
                      key={`blank-${weekIndex}-${dayIndex}`}
                      aria-hidden="true"
                      className="size-8"
                    />
                  )
                )}
              </div>
            ))}
          </div>
          {value && (
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-slot="date-range-picker-clear"
                onPress={() => setValue(null)}
                className="h-7 gap-1 px-2 text-[10px] tracking-[0.08em] text-muted-foreground uppercase"
              >
                <MaterialIcon name="close" size={12} data-icon="inline-start" />
                Limpiar
              </Button>
            </div>
          )}
        </div>
      </Popover>
    </div>
  )
}

export { DateRangePicker }
