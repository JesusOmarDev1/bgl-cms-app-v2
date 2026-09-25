export function formatTimeISO(d: Date): string {
  return d.toISOString().slice(11, 19)
}
