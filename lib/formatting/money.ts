export function cents(value: string | number | null): number | null {
  if (value === null) return null
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value))
  if (!match) throw new Error("Invalid service order amount")
  const result =
    Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"))
  if (!Number.isSafeInteger(result))
    throw new Error("Service order amount exceeds safe range")
  return result
}

export const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
})

export function money(value: number | null): string {
  return value === null ? "" : currency.format(value / 100)
}
