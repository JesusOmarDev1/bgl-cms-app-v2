const MEXICO_CITY_TIME_ZONE = "America/Mexico_City"

export type OrderDateFilterInput =
  | { mode: "period"; startDate: string; endDate?: string }
  | { mode: "specific"; dates: string[] }

type DateRangeFilter = {
  date_created: { _gte: string; _lt: string }
}

function parseLocalDate(value: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new RangeError("date must use YYYY-MM-DD")

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError("date must be a valid calendar date")
  }

  return [year, month, day]
}

function nextLocalDate(value: string): string {
  const [year, month, day] = parseLocalDate(value)
  const next = new Date(Date.UTC(year, month - 1, day + 1))
  return [
    next.getUTCFullYear().toString().padStart(4, "0"),
    (next.getUTCMonth() + 1).toString().padStart(2, "0"),
    next.getUTCDate().toString().padStart(2, "0"),
  ].join("-")
}

function mexicoCityMidnightUtc(value: string): string {
  const [year, month, day] = parseLocalDate(value)
  const localMidnightAsUtc = Date.UTC(year, month - 1, day)
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_CITY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })

  let timestamp = localMidnightAsUtc
  for (let attempt = 0; attempt < 3; attempt++) {
    const parts = Object.fromEntries(
      formatter.formatToParts(timestamp).map(({ type, value: part }) => [type, part])
    )
    const formattedAsUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    )
    timestamp = localMidnightAsUtc - (formattedAsUtc - timestamp)
  }

  return new Date(timestamp).toISOString()
}

function dateRange(startDate: string, endExclusiveDate: string): DateRangeFilter {
  return {
    date_created: {
      _gte: mexicoCityMidnightUtc(startDate),
      _lt: mexicoCityMidnightUtc(endExclusiveDate),
    },
  }
}

export function buildOrderDateFilter(input: OrderDateFilterInput) {
  if (input.mode === "period") {
    const start = parseLocalDate(input.startDate)
    const endDate = input.endDate ?? input.startDate
    const end = parseLocalDate(endDate)
    if (Date.UTC(...start) > Date.UTC(...end)) {
      throw new RangeError("endDate must not be before startDate")
    }
    return dateRange(input.startDate, nextLocalDate(endDate))
  }

  if (input.mode === "specific") {
    if (!Array.isArray(input.dates) || input.dates.length === 0) {
      throw new RangeError("specific dates must contain at least one date")
    }
    return {
      _or: input.dates.map((date) => dateRange(date, nextLocalDate(date))),
    }
  }

  throw new RangeError("unsupported order date filter mode")
}
