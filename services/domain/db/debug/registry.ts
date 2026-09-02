import { DEBUG_COLLECTION_RESOURCES } from "@/services/domain/db/debug/resources/collections"
import { DEBUG_ENDPOINT_RESOURCES } from "@/services/domain/db/debug/resources/endpoints"
import { DEBUG_SINGLETON_RESOURCES } from "@/services/domain/db/debug/resources/singletons"
import {
  DEBUG_RESOURCE_KINDS,
  type DebugKind,
  type DebugResourceDefinition,
} from "@/services/domain/db/debug/resources/types"

export { DEBUG_RESOURCE_KINDS, type DebugKind }

export const DEBUG_RESOURCE_REGISTRY = [
  ...DEBUG_SINGLETON_RESOURCES,
  ...DEBUG_COLLECTION_RESOURCES,
  ...DEBUG_ENDPOINT_RESOURCES,
] as const satisfies readonly DebugResourceDefinition[]

export type DebugResourceRegistryEntry =
  (typeof DEBUG_RESOURCE_REGISTRY)[number]
