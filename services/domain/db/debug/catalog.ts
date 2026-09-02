import { DEBUG_COLLECTION_RESOURCES } from "@/services/domain/db/debug/resources/collections"
import {
  DEBUG_RESOURCE_KINDS,
  DEBUG_RESOURCE_REGISTRY,
  type DebugKind,
  type DebugResourceRegistryEntry,
} from "@/services/domain/db/debug/registry"

export const DEBUG_KINDS = DEBUG_RESOURCE_KINDS
export type { DebugKind }

export const DEBUG_RESOURCES = DEBUG_RESOURCE_REGISTRY
export type DebugResource = DebugResourceRegistryEntry
export type DebugResourceKey = DebugResource["key"]
export type DebugCollectionKey =
  (typeof DEBUG_COLLECTION_RESOURCES)[number]["key"]

const DEBUG_KIND_VALUES: readonly string[] = DEBUG_KINDS

export function isDebugKind(value: unknown): value is DebugKind {
  return typeof value === "string" && DEBUG_KIND_VALUES.includes(value)
}

export function getDebugResourcesByKind(kind: DebugKind): DebugResource[] {
  return DEBUG_RESOURCES.filter((resource) => resource.kind === kind)
}

export function getDebugResourceEntry(
  kind: DebugKind,
  resource: string
): DebugResource | null {
  return (
    DEBUG_RESOURCES.find(
      (entry) => entry.kind === kind && entry.key === resource
    ) ?? null
  )
}

export function isDebugResourceForKind(
  kind: DebugKind,
  resource: string
): resource is DebugResourceKey {
  return getDebugResourceEntry(kind, resource) !== null
}

export function isDebugCollectionKey(
  value: string
): value is DebugCollectionKey {
  return DEBUG_COLLECTION_RESOURCES.some((entry) => entry.key === value)
}
