/**
 * Format a date to a ISO string in the format "HH:MM:SS".
 * @param d - The date to format
 * @returns ISO string in the format "HH:MM:SS"
 */
export function formatTimeISO(d: Date): string {
  return d.toISOString().slice(11, 19)
}

/**
 * Format a time in seconds to a string in the format "HH:MM:SS".
 * @param time - The time in seconds to format
 * @returns Time string in the format "HH:MM:SS"
 */
export function formatTime(time: number): string {
  if (!time || Number.isNaN(time)) return "0:00"
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
