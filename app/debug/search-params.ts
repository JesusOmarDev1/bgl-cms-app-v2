import {
  createLoader,
  createParser,
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server"

import {
  DEBUG_KINDS,
  isDebugResourceForKind,
  type DebugKind,
  type DebugResourceKey,
} from "@/services/domain/db/debug/catalog"

const parseAsPage = createParser({
  parse(queryValue) {
    const parsed = parseAsInteger.parse(queryValue)
    if (parsed === null) {
      return null
    }
    return Math.max(1, parsed)
  },
  serialize(value) {
    return parseAsInteger.serialize(value)
  },
})

const parseAsLimit = createParser({
  parse(queryValue) {
    const parsed = parseAsInteger.parse(queryValue)
    if (parsed === null) {
      return null
    }
    return Math.min(10, Math.max(1, parsed))
  },
  serialize(value) {
    return parseAsInteger.serialize(value)
  },
})

export const debugSearchParams = {
  kind: parseAsStringLiteral(DEBUG_KINDS),
  resource: parseAsString,
  page: parseAsPage.withDefault(1),
  limit: parseAsLimit.withDefault(10),
}

export const serializeDebugSearchParams = createSerializer(debugSearchParams)

const loadRawDebugSearchParams = createLoader(debugSearchParams)

export type DebugSearchParams = {
  kind: DebugKind | null
  resource: DebugResourceKey | null
  page: number
  limit: number
}

type LoadDebugSearchParamsInput = Parameters<typeof loadRawDebugSearchParams>[0]

export async function loadDebugSearchParams(
  searchParams: LoadDebugSearchParamsInput
): Promise<DebugSearchParams> {
  const parsed = await loadRawDebugSearchParams(searchParams)
  const page = parsed.page
  const limit = parsed.limit

  if (parsed.kind === null) {
    return { kind: null, resource: null, page, limit }
  }

  if (parsed.resource === null) {
    return { kind: parsed.kind, resource: null, page, limit }
  }

  if (!isDebugResourceForKind(parsed.kind, parsed.resource)) {
    return { kind: parsed.kind, resource: null, page, limit }
  }

  return {
    kind: parsed.kind,
    resource: parsed.resource,
    page,
    limit,
  }
}
