import "server-only"

/** Parse Directus `aggregate({ count: "*" })` `rows[0]?.count` into a finite number. */
export function parseAggregateCount(
  count: string | number | null | undefined
): number {
  const parsed = Number(count ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}
