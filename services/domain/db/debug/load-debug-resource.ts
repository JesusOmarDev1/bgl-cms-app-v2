import "server-only"

import { getPagesRepository } from "@/services/domain/db/repositories/collections/pages"
import { getSiteSettingsRepository } from "@/services/domain/db/repositories/singletons/site-settings"
import {
  DEBUG_RESOURCES,
  type DebugKind,
  type DebugResource,
} from "@/services/domain/db/debug/catalog"

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) {
    return true
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue)
  }

  if (typeof value === "object") {
    return Object.values(value).every(isJsonValue)
  }

  return false
}

function toJsonValue(data: unknown): JsonValue {
  const parsed: unknown = JSON.parse(JSON.stringify(data))

  if (!isJsonValue(parsed)) {
    return null
  }

  return parsed
}

async function loadDebugResourceByEntry(
  entry: DebugResource
): Promise<JsonValue> {
  switch (entry.key) {
    case "pages": {
      const data = await getPagesRepository({})
      return toJsonValue(data)
    }
    case "site_settings": {
      const data = await getSiteSettingsRepository()
      return toJsonValue(data)
    }
    default: {
      const exhaustive: never = entry
      return exhaustive
    }
  }
}

export async function loadDebugResource(
  kind: DebugKind | null,
  resource: string | null
): Promise<JsonValue | null> {
  if (kind === null || resource === null) {
    return null
  }

  const entry = DEBUG_RESOURCES.find(
    (item) => item.kind === kind && item.key === resource
  )

  if (!entry) {
    return null
  }

  return loadDebugResourceByEntry(entry)
}
