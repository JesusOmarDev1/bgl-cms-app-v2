"use client"

import { useEffect, useMemo, useRef } from "react"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { useCatalogParams } from "@/components/collections/catalog/useCatalogParams"
import { useDebounceFn } from "@/hooks/useDebounceFn"
import {
  normalizeCatalogFilterParams,
  normalizeCatalogFilters,
  type CatalogFilters,
  type CatalogItem,
} from "@/components/collections/catalog/catalog-items"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type CatalogLabels = {
  category: {
    label: string
    placeholder: string
    all: string
  }
  search: {
    label: string
    placeholder: string
  }
  sort: {
    label: string
    newest: string
    oldest: string
    az: string
    za: string
  }
  filters?: {
    brand: string
    capacity: string
    division: string
    all: string
  }
  clear: string
}

export function CatalogToolBarClient({
  items,
  labels,
  shallow = true,
  paginated = false,
  showCategoryFilter = true,
  showProductFilters = false,
}: {
  items: readonly CatalogItem[]
  labels: CatalogLabels
  shallow?: boolean
  paginated?: boolean
  showCategoryFilter?: boolean
  showProductFilters?: boolean
}) {
  const {
    q,
    setQ,
    cat,
    setCat,
    brand,
    setBrand,
    capacity,
    setCapacity,
    division,
    setDivision,
    sort,
    setSort,
    clearFilters,
  } = useCatalogParams(shallow, paginated, !showCategoryFilter)
  const searchInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (searchInputRef.current && searchInputRef.current.value !== q) {
      searchInputRef.current.value = q
    }
  }, [q])
  const commitQuery = useMemo(
    () => (value: string) => void setQ(value || null),
    [setQ]
  )
  const queryDebounce = useDebounceFn(commitQuery, 500)
  const categories = useMemo(() => {
    const seen = new Map<string, { title: string; icon: string | null }>()
    for (const item of items) {
      if (!item.categorySlug || !item.categoryTitle) continue
      if (!seen.has(item.categorySlug)) {
        seen.set(item.categorySlug, {
          title: item.categoryTitle,
          icon: item.categoryIcon ?? null,
        })
      }
    }
    return [...seen.entries()]
      .map(([slug, { title, icon }]) => ({ slug, title, icon }))
      .sort((a, b) =>
        a.title.localeCompare(b.title, "es", { sensitivity: "base" })
      )
  }, [items])
  const selectedCategory = categories.some((category) => category.slug === cat)
    ? cat
    : null
  const filters: CatalogFilters = { brand, capacity, division }
  const activeFilters = normalizeCatalogFilters(items, filters)
  const normalizedFilterParams = useMemo(
    () =>
      normalizeCatalogFilterParams(
        items,
        new URLSearchParams({ brand, capacity, division })
      ),
    [brand, capacity, division, items]
  )
  useEffect(() => {
    if (!showProductFilters) return
    if (brand && !normalizedFilterParams.has("brand")) void setBrand(null)
    if (capacity && !normalizedFilterParams.has("capacity"))
      void setCapacity(null)
    if (division && !normalizedFilterParams.has("division"))
      void setDivision(null)
  }, [
    brand,
    capacity,
    division,
    normalizedFilterParams,
    setBrand,
    setCapacity,
    setDivision,
    showProductFilters,
  ])
  const facetOptions = useMemo(
    () => ({
      brand: [
        ...new Set(items.flatMap((item) => (item.brand ? [item.brand] : []))),
      ].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })),
      capacity: [
        ...new Set(
          items.flatMap((item) =>
            item.capacity == null ? [] : [String(item.capacity)]
          )
        ),
      ].sort((a, b) => Number(a) - Number(b)),
      division: [
        ...new Set(
          items.flatMap((item) =>
            item.division == null ? [] : [String(item.division)]
          )
        ),
      ].sort((a, b) => Number(a) - Number(b)),
    }),
    [items]
  )
  const filtersActive =
    q.length > 0 ||
    (showCategoryFilter && cat.length > 0) ||
    (showProductFilters &&
      Object.values(activeFilters).some((value) => value.length > 0))

  function renderFacet(
    label: string,
    value: string,
    setValue: (value: string | null) => void,
    options: string[]
  ) {
    return (
      <Select
        aria-label={label}
        className="w-full lg:w-48"
        onSelectionChange={(selected) =>
          setValue(
            selected == null || selected === "__reset__"
              ? null
              : String(selected).slice("value:".length)
          )
        }
        placeholder={label}
        selectedKey={options.includes(value) ? `value:${value}` : null}
      >
        <SelectTrigger aria-label={label} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem id="__reset__" textValue={labels.filters?.all ?? label}>
            {labels.filters?.all ?? label}
          </SelectItem>
          {options.map((option) => (
            <SelectItem id={`value:${option}`} key={option} textValue={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <Select
        hidden={!showCategoryFilter}
        aria-label={labels.category.label}
        className="w-full lg:w-64"
        onSelectionChange={(key) => {
          if (key == null || key === "all") {
            void setCat(null)
            return
          }
          void setCat(String(key))
        }}
        placeholder={labels.category.placeholder}
        selectedKey={selectedCategory}
      >
        <SelectTrigger aria-label={labels.category.label} className="w-full">
          <MaterialIcon
            className="text-muted-foreground"
            name="category"
            size={16}
          />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem id="all" textValue={labels.category.all}>
            <span className="flex items-center gap-2">
              <MaterialIcon aria-hidden name="category" size={16} />
              {labels.category.all}
            </span>
          </SelectItem>
          {categories.map((category) => (
            <SelectItem
              id={category.slug}
              key={category.slug}
              textValue={category.title}
            >
              <span className="flex items-center gap-2">
                <MaterialIcon
                  aria-hidden
                  name={category.icon || "category"}
                  size={16}
                />
                {category.title}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative w-full min-w-0 flex-1">
        <MaterialIcon
          className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          name="search"
          size={16}
        />
        <Input
          aria-label={labels.search.label}
          className="ps-8"
          onChange={(event) => {
            const value = event?.target.value ?? ""
            if (!value) {
              queryDebounce.cancel()
              void setQ(null)
            } else queryDebounce.run(value)
          }}
          placeholder={labels.search.placeholder}
          ref={searchInputRef}
          type="search"
          defaultValue={q}
        />
      </div>
      {showProductFilters && labels.filters ? (
        <>
          {renderFacet(
            labels.filters.brand,
            brand,
            setBrand,
            facetOptions.brand
          )}
          {renderFacet(
            labels.filters.capacity,
            capacity,
            setCapacity,
            facetOptions.capacity
          )}
          {renderFacet(
            labels.filters.division,
            division,
            setDivision,
            facetOptions.division
          )}
        </>
      ) : null}
      <Select
        aria-label={labels.sort.label}
        className="w-full lg:w-48"
        onSelectionChange={(key) => {
          if (
            key === "newest" ||
            key === "oldest" ||
            key === "a-z" ||
            key === "z-a"
          ) {
            void setSort(key)
          }
        }}
        selectedKey={sort}
      >
        <SelectTrigger aria-label={labels.sort.label} className="w-full">
          <MaterialIcon
            className="text-muted-foreground"
            name="swap_vert"
            size={16}
          />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem id="newest" textValue={labels.sort.newest}>
            {labels.sort.newest}
          </SelectItem>
          <SelectItem id="oldest" textValue={labels.sort.oldest}>
            {labels.sort.oldest}
          </SelectItem>
          <SelectItem id="a-z" textValue={labels.sort.az}>
            {labels.sort.az}
          </SelectItem>
          <SelectItem id="z-a" textValue={labels.sort.za}>
            {labels.sort.za}
          </SelectItem>
        </SelectContent>
      </Select>
      {filtersActive ? (
        <Button
          onPress={() => {
            queryDebounce.cancel()
            clearFilters()
          }}
          variant="ghost"
        >
          {labels.clear}
        </Button>
      ) : null}
    </div>
  )
}
