import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server"

import { DEBUG_KINDS } from "@/services/domain/db/debug/catalog"

export const debugSearchParams = {
  kind: parseAsStringLiteral(DEBUG_KINDS),
  resource: parseAsString,
}

export const loadDebugSearchParams = createLoader(debugSearchParams)
