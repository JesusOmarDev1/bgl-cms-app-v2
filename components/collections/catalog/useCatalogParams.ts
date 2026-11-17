"use client"

import { useCallback } from "react"
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

export function useCatalogParams(
  shallow = true,
  paginated = false,
  preserveCategory = false
) {
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
  const [brand, setBrand] = useQueryState(
    "brand",
    parseAsString.withDefault("").withOptions(options)
  )
  const [capacity, setCapacity] = useQueryState(
    "capacity",
    parseAsString.withDefault("").withOptions(options)
  )
  const [division, setDivision] = useQueryState(
    "division",
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

  const updateFilter = useCallback(
    (setter: typeof setBrand, value: string | null) => {
      if (paginated) void setPage(null)
      return setter(value)
    },
    [paginated, setPage]
  )
  const updateBrand = useCallback(
    (value: string | null) => updateFilter(setBrand, value),
    [setBrand, updateFilter]
  )
  const updateCapacity = useCallback(
    (value: string | null) => updateFilter(setCapacity, value),
    [setCapacity, updateFilter]
  )
  const updateDivision = useCallback(
    (value: string | null) => updateFilter(setDivision, value),
    [setDivision, updateFilter]
  )

  function clearFilters() {
    void setQ(null)
    if (!preserveCategory) void setCat(null)
    void setBrand(null)
    void setCapacity(null)
    void setDivision(null)
    if (paginated) void setPage(null)
  }

  return {
    q,
    setQ: updateQuery,
    cat,
    setCat: updateCategory,
    brand,
    setBrand: updateBrand,
    capacity,
    setCapacity: updateCapacity,
    division,
    setDivision: updateDivision,
    sort,
    setSort: updateSort,
    page,
    setPage,
    clearFilters,
  }
}

export type { CatalogSort }
