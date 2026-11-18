"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import type { CatalogFilters } from "@/components/collections/catalog/catalog-items"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export type CatalogFilterFacet = {
  key: keyof CatalogFilters
  label: string
  options: string[]
}

export type CatalogFilterOptionsProps = {
  facets: CatalogFilterFacet[]
  value: CatalogFilters
  countFor: (filters: CatalogFilters) => number
  onApply: (filters: CatalogFilters) => void
  onClear: () => void
}

/** Sheet body kept separate so it renders without the closed overlay portal. */
export function CatalogFilterOptions({
  facets,
  value,
  countFor,
  onApply,
  onClear,
}: CatalogFilterOptionsProps) {
  const catalog = useTranslations("catalog")
  const [pending, setPending] = useState<CatalogFilters>(value)
  const all = catalog("filter_all")

  return (
    <>
      <SheetHeader>
        <SheetTitle>{catalog("filters_title")}</SheetTitle>
      </SheetHeader>
      <div className="flex flex-col gap-2 overflow-y-auto px-4">
        {facets.map((facet) => (
          <RadioGroup
            aria-label={facet.label}
            className="gap-0"
            key={facet.key}
            onChange={(selected) =>
              setPending((current) => ({
                ...current,
                [facet.key]: String(selected),
              }))
            }
            value={pending[facet.key] ?? ""}
          >
            {["", ...facet.options].map((option) => (
              <div
                className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 last:border-b-0"
                key={option || "all"}
              >
                <span className="text-sm">
                  <span className="text-muted-foreground">{facet.label}: </span>
                  {option || all}
                </span>
                <RadioGroupItem
                  aria-label={`${facet.label}: ${option || all}`}
                  value={option}
                />
              </div>
            ))}
          </RadioGroup>
        ))}
      </div>
      <SheetFooter className="flex-row items-center gap-2">
        <Button onPress={onClear} variant="ghost">
          {catalog("clear_filters")}
        </Button>
        <Button
          className="flex-1"
          onPress={() => onApply(pending)}
          slot="close"
        >
          {catalog("filters_apply", { count: countFor(pending) })}
        </Button>
      </SheetFooter>
    </>
  )
}

export function CatalogFilterSheet({
  activeCount,
  ...options
}: { activeCount: number } & CatalogFilterOptionsProps) {
  const catalog = useTranslations("catalog")

  return (
    <SheetTrigger>
      <Button
        aria-label={catalog("filters_button", { count: activeCount })}
        className="self-start lg:hidden"
        variant="outline"
      >
        <MaterialIcon name="filter_list" size={16} />
        {catalog("filters_title")}
        {activeCount > 0 ? (
          <Badge className="tabular-nums" variant="secondary">
            {activeCount}
          </Badge>
        ) : null}
      </Button>
      <Sheet side="bottom">
        <CatalogFilterOptions {...options} />
      </Sheet>
    </SheetTrigger>
  )
}
