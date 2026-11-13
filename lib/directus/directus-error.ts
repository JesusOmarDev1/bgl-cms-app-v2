import "server-only"

import type { DirectusError } from "@/types/directus/errors"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isDirectusErrorEntry(entry: unknown): entry is DirectusError {
  return (
    isRecord(entry) &&
    typeof entry.message === "string" &&
    isRecord(entry.extensions) &&
    typeof entry.extensions.code === "string"
  )
}

/** Entries of an SDK error or of a raw body (ofetch wraps the body under `data`). */
function errorEntries(error: unknown): DirectusError[] {
  if (!isRecord(error)) return []
  return [error.errors, isRecord(error.data) ? error.data.errors : undefined]
    .flatMap((source) => (Array.isArray(source) ? source : []))
    .filter(isDirectusErrorEntry)
}

/** Every official code (`extensions.code`) a Directus failure carries. */
export function getDirectusCodes(error: unknown): string[] {
  return errorEntries(error).map((entry) => entry.extensions.code)
}

/** The first official code, i.e. the `errors[0]` the Directus error docs show. */
export function getDirectusCode(error: unknown): string | undefined {
  return getDirectusCodes(error)[0]
}

/** Network-level failure: Directus never answered, so there is no code to branch on. */
export function isTransportFailure(error: unknown): boolean {
  return error instanceof TypeError
}
