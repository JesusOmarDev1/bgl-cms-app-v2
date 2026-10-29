"use client"

import { useMemo } from "react"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { useCatalogParams } from "@/components/collections/catalog/useCatalogParams"
import { useDebounceFn } from "@/hooks/useDebounceFn"
import type { CatalogItem } from "@/components/collections/catalog/catalog-items"
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
  clear: string
}

export function CatalogToolBarClient({
  items,
  labels,
  shallow = true,
  paginated = false,
}: {
  items: readonly CatalogItem[]
  labels: CatalogLabels
  shallow?: boolean
  paginated?: boolean
}) {
  const { q, setQ, cat, setCat, sort, setSort, clearFilters } =
    useCatalogParams(shallow, paginated)
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
  const filtersActive = q.length > 0 || cat.length > 0

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <Select
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
          type="search"
          defaultValue={q}
          key={q}
        />
      </div>
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
