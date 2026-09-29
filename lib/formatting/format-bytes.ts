/**
 * Format a number of bytes to a human readable string.
 * @param bytes - The number of bytes to format
 * @returns A human readable string
 */
export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"]
  const index = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, index)).toFixed(2) + " " + units[index]
}
