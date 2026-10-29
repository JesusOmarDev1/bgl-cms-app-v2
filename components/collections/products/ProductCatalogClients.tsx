"use client"

import { CatalogBodyClient } from "@/components/collections/catalog/CatalogBodyClient"
import { CatalogToolBarClient } from "@/components/collections/catalog/CatalogToolBarClient"
import type { CatalogLabels } from "@/components/collections/catalog/CatalogToolBarClient"
import { ProductCard } from "@/components/collections/products/ProductCard"
import type { ProductCardData } from "@/components/collections/products/product-card"

export function ProductCatalogClients({
  items,
  labels,
  emptyCatalog,
  noMatches,
  clearLabel,
}: {
  items: ProductCardData[]
  labels: CatalogLabels
  emptyCatalog: string
  noMatches: string
  clearLabel: string
}) {
  return (
    <>
      <CatalogToolBarClient
        items={items}
        labels={labels}
        paginated
        shallow={false}
      />
      <CatalogBodyClient
        clearLabel={clearLabel}
        emptyCatalog={emptyCatalog}
        items={items}
        noMatches={noMatches}
        pageSize={24}
        paginated
        renderItem={(item) => <ProductCard product={item} />}
        shallow={false}
      />
    </>
  )
}
