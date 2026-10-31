"use client"

import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs"
import {
  CATALOG_SORTS,
  type CatalogSort,
} from "@/components/collections/catalog/catalog-items"

const queryOptions = (shallow: boolean) =>
  ({
    history: "replace",
    scroll: false,
    shallow,
  }) as const

export function useCatalogParams(shallow = true, paginated = false) {
  const options = queryOptions(shallow)
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions(options)
  )
  const [q, setQ] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions(options)
  )
  const [cat, setCat] = useQueryState(
    "cat",
    parseAsString.withDefault("").withOptions(options)
  )
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringLiteral(CATALOG_SORTS)
      .withDefault("newest")
      .withOptions(options)
  )

  function updateQuery(value: string | null) {
    if (paginated) void setPage(null)
    return setQ(value)
  }

  function updateCategory(value: string | null) {
    if (paginated) void setPage(null)
    return setCat(value)
  }

  function updateSort(value: CatalogSort) {
    if (paginated) void setPage(null)
    return setSort(value)
  }

  function clearFilters() {
    void setQ(null)
    void setCat(null)
    if (paginated) void setPage(null)
  }

  return {
    q,
    setQ: updateQuery,
    cat,
    setCat: updateCategory,
    sort,
    setSort: updateSort,
    page,
    setPage,
    clearFilters,
  }
}

export type { CatalogSort }
