"use client"

import { CatalogBodyClient } from "@/components/collections/catalog/CatalogBodyClient"
import { CatalogToolBarClient } from "@/components/collections/catalog/CatalogToolBarClient"
import type { CatalogLabels } from "@/components/collections/catalog/CatalogToolBarClient"
import {
  ManualCard,
  type ManualCardData,
} from "@/components/collections/manuals/ManualCard"

export function ManualCatalogClients({
  items,
  labels,
  emptyCatalog,
  noMatches,
  clearLabel,
}: {
  items: ManualCardData[]
  labels: CatalogLabels
  emptyCatalog: string
  noMatches: string
  clearLabel: string
}) {
  return (
    <>
      <CatalogToolBarClient items={items} labels={labels} />
      <CatalogBodyClient
        clearLabel={clearLabel}
        emptyCatalog={emptyCatalog}
        items={items}
        noMatches={noMatches}
        renderItem={(item) => <ManualCard data={item} />}
      />
    </>
  )
}
