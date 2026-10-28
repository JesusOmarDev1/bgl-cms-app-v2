"use client"

import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs"
import {
  CATALOG_SORTS,
  type CatalogSort,
} from "@/components/collections/catalog/catalog-items"

const queryOptions = {
  history: "replace",
  scroll: false,
  shallow: true,
} as const

export function useCatalogParams() {
  const [q, setQ] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions(queryOptions)
  )
  const [cat, setCat] = useQueryState(
    "cat",
    parseAsString.withDefault("").withOptions(queryOptions)
  )
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringLiteral(CATALOG_SORTS)
      .withDefault("newest")
      .withOptions(queryOptions)
  )

  function clearFilters() {
    void setQ(null)
    void setCat(null)
  }

  return {
    q,
    setQ,
    cat,
    setCat,
    sort,
    setSort,
    clearFilters,
  }
}

export type { CatalogSort }
