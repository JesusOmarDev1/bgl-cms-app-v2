import type { DebugResourceDefinition } from "@/services/domain/db/debug/resources/types"

export const DEBUG_ENDPOINT_RESOURCES = [
  {
    kind: "endpoints",
    key: "health",
    label: "health",
    labelKey: "resources.health",
  },
] as const satisfies readonly DebugResourceDefinition[]
