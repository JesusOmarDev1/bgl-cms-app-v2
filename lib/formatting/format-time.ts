export function formatTimeISO(d = new Date()): string {
  return d.toISOString().slice(11, 19)
}
