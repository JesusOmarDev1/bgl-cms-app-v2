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

  // Any narrowing resets pagination so the current page never outruns the results.
  function update<T>(setter: (value: T | null) => unknown, value: T | null) {
    if (paginated) void setPage(null)
    void setter(value)
  }

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
    setQ: (value: string | null) => update(setQ, value),
    cat,
    setCat: (value: string | null) => update(setCat, value),
    brand,
    setBrand: (value: string | null) => update(setBrand, value),
    capacity,
    setCapacity: (value: string | null) => update(setCapacity, value),
    division,
    setDivision: (value: string | null) => update(setDivision, value),
    sort,
    setSort: (value: CatalogSort) => update(setSort, value),
    page,
    setPage,
    clearFilters,
  }
}

export type { CatalogSort }
