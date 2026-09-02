type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export function isJsonValue(value: unknown): value is JsonValue {
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

export function toJsonValue(data: unknown): JsonValue {
  const parsed: unknown = JSON.parse(JSON.stringify(data))

  if (!isJsonValue(parsed)) {
    return null
  }

  return parsed
}
