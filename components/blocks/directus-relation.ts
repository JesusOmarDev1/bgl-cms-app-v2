import type { DirectusFileTypes } from "@/types/shared/directus/directus-file"

export function directusFileId(
  file: string | DirectusFileTypes | null | undefined
): string | null {
  if (typeof file === "string") return file || null
  if (!file) return null
  return file.id || null
}

export function isExpanded<T>(
  value: string | T | null | undefined
): value is T {
  return typeof value === "object" && value !== null
}

export function expandedJunctions<T extends object>(rows: unknown): T[] {
  if (!Array.isArray(rows)) return []
  const list: T[] = []
  for (const row of rows) {
    if (typeof row !== "object" || row === null || Array.isArray(row)) continue
    list.push(row as T)
  }
  return list
}

/** Missing status (field not selected) stays visible. A real non-published status does not. */
export function isPublishedStatus(status: unknown): boolean {
  return typeof status !== "string" || status === "published"
}
