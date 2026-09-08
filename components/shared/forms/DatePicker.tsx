"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import {
  clampDate,
  gridKeyToDate,
  monthCells,
  monthIndex,
  sameDay,
  startOfDay,
} from "@/lib/forms/calendar/calendar-utils"

const DEFAULT_INTL_LOCALE = "en-US"
const DEFAULT_INTL_TIME_ZONE = "UTC"

function toUtcCalendarDate(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

export type DateCalendarProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue"
> & {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (date: Date | null) => void
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  min?: Date
  max?: Date
  disabledDate?: (d: Date) => boolean
  locale?: string
  weekStartsOn?: 0 | 1
}

type DateCalendarDayProps = {
  day: Date
  selected: Date | null
  today: Date
  disabled: boolean
  dayLabel: string
  tabIndex: number
  onSelect: (day: Date) => void
  onKeyDown: (event: React.KeyboardEvent, day: Date) => void
}

function DateCalendarDay({
  day,
  selected,
  today,
  disabled,
  dayLabel,
  tabIndex,
  onSelect,
  onKeyDown,
}: DateCalendarDayProps) {
  const isSelected = sameDay(day, selected)
  const isToday = sameDay(day, today)

  return (
    <button
      type="button"
      role="gridcell"
      data-day={day.getTime()}
      data-slot="date-picker-calendar-day"
      disabled={disabled}
      aria-selected={isSelected}
      aria-current={isToday ? "date" : undefined}
      aria-label={dayLabel}
      onClick={() => onSelect(day)}
      onKeyDown={(e) => onKeyDown(e, day)}
      tabIndex={tabIndex}
      className={cn(
        "relative size-8 rounded-sm font-mono text-xs tabular-nums transition-colors outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-30 disabled:hover:bg-transparent",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary",
        !isSelected && isToday && "ring-1 ring-primary/60 ring-inset"
      )}
    >
      {day.getDate()}
    </button>
  )
}

type DateCalendarWeekProps = {
  week: (Date | null)[]
  weekIndex: number
  viewMonth: Date
  weekdays: string[]
  selected: Date | null
  today: Date
  tabbable: Date
  isDayDisabled: (day: Date) => boolean
  dayLabelFmt: Intl.DateTimeFormat
  onSelect: (day: Date) => void
  onKeyDown: (event: React.KeyboardEvent, day: Date) => void
}

function DateCalendarWeek({
  week,
  weekIndex,
  viewMonth,
  weekdays,
  selected,
  today,
  tabbable,
  isDayDisabled,
  dayLabelFmt,
  onSelect,
  onKeyDown,
}: DateCalendarWeekProps) {
  return (
    <div
      key={
        week.find((cell) => cell !== null)?.getTime() ??
        `empty-week-${viewMonth.getTime()}-${weekIndex}`
      }
      role="row"
      className="grid grid-cols-7"
    >
      {week.map((day, dayIndex) => {
        if (!day) {
          return (
            <span
              key={`empty-${viewMonth.getTime()}-${weekIndex}-${weekdays[dayIndex]}`}
              aria-hidden="true"
              className="size-8"
            />
          )
        }

        return (
          <DateCalendarDay
            key={day.getTime()}
            day={day}
            selected={selected}
            today={today}
            disabled={isDayDisabled(day)}
            dayLabel={dayLabelFmt.format(toUtcCalendarDate(day))}
            tabIndex={sameDay(day, tabbable) ? 0 : -1}
            onSelect={onSelect}
            onKeyDown={onKeyDown}
          />
        )
      })}
    </div>
  )
}

function buildMonthWeeks(viewMonth: Date, weekStartsOn: 0 | 1) {
  const cells = monthCells(viewMonth, weekStartsOn)
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

function resolveTabbableDay(
  selected: Date | null,
  today: Date,
  viewMonth: Date,
  isMonthVisible: (day: Date) => boolean
) {
  if (selected && isMonthVisible(selected)) return selected
  if (isMonthVisible(today)) return today
  return viewMonth
}

function DateCalendarHeader({
  monthCaption,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  monthCaption: string
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div
      data-slot="date-picker-calendar-header"
      className="mb-2 flex items-center justify-between"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Previous month"
        isDisabled={!canPrev}
        onClick={onPrev}
        className="size-7"
      >
        <ChevronLeft className="size-3.5 rtl:rotate-180" />
      </Button>
      <span
        data-slot="date-picker-calendar-caption"
        className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase tabular-nums"
      >
        {monthCaption}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Next month"
        isDisabled={!canNext}
        onClick={onNext}
        className="size-7"
      >
        <ChevronRight className="size-3.5 rtl:rotate-180" />
      </Button>
    </div>
  )
}

type DateCalendarGridProps = {
  monthCaption: string
  weekdays: string[]
  weeks: (Date | null)[][]
  viewMonth: Date
  selected: Date | null
  today: Date
  tabbable: Date
  isDayDisabled: (day: Date) => boolean
  dayLabelFmt: Intl.DateTimeFormat
  onSelect: (day: Date) => void
  onKeyDown: (event: React.KeyboardEvent, day: Date) => void
}

function DateCalendarGrid({
  monthCaption,
  weekdays,
  weeks,
  viewMonth,
  selected,
  today,
  tabbable,
  isDayDisabled,
  dayLabelFmt,
  onSelect,
  onKeyDown,
}: DateCalendarGridProps) {
  return (
    <div
      role="grid"
      aria-label={monthCaption}
      data-slot="date-picker-calendar-grid"
      className="grid gap-y-0.5"
    >
      <div role="row" className="grid grid-cols-7">
        {weekdays.map((label) => (
          <span
            key={label}
            role="columnheader"
            data-slot="date-picker-calendar-weekday"
            className="flex h-7 items-center justify-center font-mono text-[10px] text-muted-foreground uppercase"
          >
            {label}
          </span>
        ))}
      </div>
      {weeks.map((week, weekIndex) => (
        <DateCalendarWeek
          key={
            week.find((cell) => cell !== null)?.getTime() ??
            `empty-week-${viewMonth.getTime()}-${weekIndex}`
          }
          week={week}
          weekIndex={weekIndex}
          viewMonth={viewMonth}
          weekdays={weekdays}
          selected={selected}
          today={today}
          tabbable={tabbable}
          isDayDisabled={isDayDisabled}
          dayLabelFmt={dayLabelFmt}
          onSelect={onSelect}
          onKeyDown={onKeyDown}
        />
      ))}
    </div>
  )
}

function DateCalendar({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  min,
  max,
  disabledDate,
  locale,
  weekStartsOn = 1,
  className,
  ...props
}: DateCalendarProps) {
  const [internal, setInternal] = React.useState<Date | null>(defaultValue)
  const value = valueProp !== undefined ? valueProp : internal
  const today = startOfDay(new Date())

  const [internalMonth, setInternalMonth] = React.useState<Date>(() => {
    const anchor = monthProp ?? defaultMonth ?? value ?? today
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  })
  const viewMonth =
    monthProp !== undefined
      ? new Date(monthProp.getFullYear(), monthProp.getMonth(), 1)
      : internalMonth
  const setViewMonth = (next: Date) => {
    if (monthProp === undefined) setInternalMonth(next)
    onMonthChange?.(next)
  }

  const valueMonthKey = valueProp != null ? monthIndex(valueProp) : null
  const [prevValueMonthKey, setPrevValueMonthKey] =
    React.useState(valueMonthKey)
  if (valueMonthKey !== prevValueMonthKey) {
    setPrevValueMonthKey(valueMonthKey)
    if (valueProp != null && monthProp === undefined) {
      setInternalMonth(
        new Date(valueProp.getFullYear(), valueProp.getMonth(), 1)
      )
    }
  }

  const setValue = React.useCallback(
    (next: Date | null) => {
      if (valueProp === undefined) setInternal(next)
      onValueChange?.(next)
    },
    [valueProp, onValueChange]
  )

  const isDayDisabled = React.useCallback(
    (d: Date) => {
      if (min && d.getTime() < startOfDay(min).getTime()) return true
      if (max && d.getTime() > startOfDay(max).getTime()) return true
      return disabledDate ? disabledDate(d) : false
    },
    [min, max, disabledDate]
  )

  const selected = value ? startOfDay(value) : null

  const isMonthVisible = (d: Date) => monthIndex(d) === monthIndex(viewMonth)

  const canPrev =
    !min ||
    new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 0).getTime() >=
      startOfDay(min).getTime()
  const canNext =
    !max ||
    new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1).getTime() <=
      startOfDay(max).getTime()

  const stepMonth = (n: number) =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + n, 1))

  const rootRef = React.useRef<HTMLDivElement>(null)
  const focusDay = (d: Date) => {
    const doFocus = () => {
      rootRef.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${d.getTime()}"]`)
        ?.focus()
    }
    if (!isMonthVisible(d)) {
      setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1))
      requestAnimationFrame(doFocus)
    } else {
      doFocus()
    }
  }

  const handleKey = (e: React.KeyboardEvent, d: Date) => {
    const forward =
      getComputedStyle(e.currentTarget).direction === "rtl" ? -1 : 1
    const next = gridKeyToDate(e.key, d, {
      weekStartsOn,
      shiftKey: e.shiftKey,
      forward,
    })
    if (!next) return
    e.preventDefault()
    focusDay(clampDate(next, min, max))
  }

  const resolvedLocale = locale ?? DEFAULT_INTL_LOCALE
  const monthFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(resolvedLocale, {
        month: "long",
        year: "numeric",
        timeZone: DEFAULT_INTL_TIME_ZONE,
      }),
    [resolvedLocale]
  )
  const weekdayFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(resolvedLocale, {
        weekday: "short",
        timeZone: DEFAULT_INTL_TIME_ZONE,
      }),
    [resolvedLocale]
  )
  const dayLabelFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(resolvedLocale, {
        dateStyle: "full",
        timeZone: DEFAULT_INTL_TIME_ZONE,
      }),
    [resolvedLocale]
  )
  const monthCaption = monthFmt.format(toUtcCalendarDate(viewMonth))
  const weekdays = React.useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        weekdayFmt.format(
          new Date(Date.UTC(2021, 7, 1 + ((weekStartsOn + i) % 7)))
        )
      ),
    [weekStartsOn, weekdayFmt]
  )

  const weeks = buildMonthWeeks(viewMonth, weekStartsOn)
  const tabbable = resolveTabbableDay(
    selected,
    today,
    viewMonth,
    isMonthVisible
  )

  return (
    <div
      ref={rootRef}
      data-slot="date-picker-calendar"
      className={cn("w-60", className)}
      {...props}
    >
      <DateCalendarHeader
        monthCaption={monthCaption}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={() => stepMonth(-1)}
        onNext={() => stepMonth(1)}
      />
      <DateCalendarGrid
        monthCaption={monthCaption}
        weekdays={weekdays}
        weeks={weeks}
        viewMonth={viewMonth}
        selected={selected}
        today={today}
        tabbable={tabbable}
        isDayDisabled={isDayDisabled}
        dayLabelFmt={dayLabelFmt}
        onSelect={setValue}
        onKeyDown={handleKey}
      />
    </div>
  )
}

type DatePickerContextValue = {
  value: Date | null
  setValue: (date: Date | null) => void
  open: boolean
  setOpen: (open: boolean) => void
  min?: Date
  max?: Date
  disabled?: boolean
}

const DatePickerContext = React.createContext<DatePickerContextValue | null>(
  null
)

function useDatePicker() {
  const ctx = React.useContext(DatePickerContext)
  if (!ctx) {
    throw new Error(
      "DatePicker compound components must be used inside <DatePicker>"
    )
  }
  return ctx
}

export type DatePickerProps = {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (date: Date | null) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  min?: Date
  max?: Date
  disabled?: boolean
  children?: React.ReactNode
}

function DatePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  min,
  max,
  disabled,
  children,
}: DatePickerProps) {
  const [internalValue, setInternalValue] = React.useState<Date | null>(
    defaultValue
  )
  const value = valueProp !== undefined ? valueProp : internalValue
  const setValue = React.useCallback(
    (next: Date | null) => {
      if (valueProp === undefined) setInternalValue(next)
      onValueChange?.(next)
    },
    [valueProp, onValueChange]
  )

  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = openProp !== undefined ? openProp : internalOpen
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange]
  )

  const ctx = React.useMemo<DatePickerContextValue>(
    () => ({ value, setValue, open, setOpen, min, max, disabled }),
    [value, setValue, open, setOpen, min, max, disabled]
  )

  return (
    <DatePickerContext.Provider value={ctx}>
      <Popover isOpen={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </DatePickerContext.Provider>
  )
}

function DatePickerTrigger({
  placeholder = "Pick a date",
  locale,
  className,
  children,
  "aria-label": ariaLabelProp,
  "aria-labelledby": ariaLabelledByProp,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  placeholder?: string
  locale?: string
  children?: React.ReactNode
}) {
  const ctx = useDatePicker()
  const resolvedLocale = locale ?? DEFAULT_INTL_LOCALE
  const fmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(resolvedLocale, {
        dateStyle: "medium",
        timeZone: DEFAULT_INTL_TIME_ZONE,
      }),
    [resolvedLocale]
  )
  const selectedValueLabel = ctx.value
    ? fmt.format(toUtcCalendarDate(ctx.value))
    : null
  const triggerLabel = children ?? selectedValueLabel ?? placeholder
  const triggerAriaLabel =
    ariaLabelProp ??
    (ariaLabelledByProp
      ? undefined
      : selectedValueLabel
        ? `Selected date ${selectedValueLabel}`
        : "Select date")
  return (
    <PopoverTrigger>
      <button
        type="button"
        disabled={ctx.disabled}
        aria-label={triggerAriaLabel}
        aria-labelledby={ariaLabelledByProp}
        data-slot="date-picker-trigger"
        data-state={ctx.open ? "open" : "closed"}
        className={cn(
          "inline-flex h-9 w-full items-center gap-2 rounded-sm border border-input bg-transparent px-3 text-start font-mono text-sm tabular-nums transition-colors outline-none",
          "hover:border-ring/60 focus-visible:border-ring data-[state=open]:border-ring",
          !ctx.value && "font-sans text-muted-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <span data-slot="date-picker-trigger-label" className="flex-1 truncate">
          {triggerLabel}
        </span>
      </button>
    </PopoverTrigger>
  )
}

function DatePickerContent({
  locale,
  weekStartsOn,
  disabledDate,
  month,
  defaultMonth,
  onMonthChange,
  className,
  ...props
}: React.ComponentProps<typeof Popover> & {
  locale?: string
  weekStartsOn?: 0 | 1
  disabledDate?: (d: Date) => boolean
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
}) {
  const ctx = useDatePicker()
  return (
    <div
      data-slot="date-picker-content"
      className={cn("w-auto p-3", className)}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      <div data-slot="date-picker-content-body" className="flex flex-col gap-2">
        <DateCalendar
          value={ctx.value}
          onValueChange={(d) => {
            ctx.setValue(d)
            ctx.setOpen(false)
          }}
          month={month}
          defaultMonth={defaultMonth}
          onMonthChange={onMonthChange}
          min={ctx.min}
          max={ctx.max}
          disabledDate={disabledDate}
          locale={locale}
          weekStartsOn={weekStartsOn}
        />
        {ctx.value && (
          <div
            data-slot="date-picker-content-footer"
            className="flex justify-end"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-slot="date-picker-clear"
              onClick={() => ctx.setValue(null)}
              className="h-7 gap-1 px-2 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase"
            >
              <X className="size-3" />
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export { DatePicker, DatePickerTrigger, DatePickerContent, DateCalendar }
