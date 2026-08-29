export const DEBUG_KINDS = ["singleton", "collections"] as const
export type DebugKind = (typeof DEBUG_KINDS)[number]

export const DEBUG_RESOURCES = [
  { kind: "singleton", key: "site_settings", label: "site_settings" },
  { kind: "collections", key: "pages", label: "pages" },
] as const

export type DebugResource = (typeof DEBUG_RESOURCES)[number]

const DEBUG_KIND_VALUES: readonly string[] = DEBUG_KINDS

export function isDebugKind(value: unknown): value is DebugKind {
  return typeof value === "string" && DEBUG_KIND_VALUES.includes(value)
}

export function getDebugResourcesByKind(kind: DebugKind): DebugResource[] {
  return DEBUG_RESOURCES.filter((resource) => resource.kind === kind)
}
