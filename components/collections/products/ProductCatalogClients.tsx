"use client"

import Link from "next/link"
import { useQueryState, parseAsString } from "nuqs"
import { CatalogBodyClient } from "@/components/collections/catalog/CatalogBodyClient"
import {
  getCatalogNavigationStage,
  type CatalogHierarchy,
} from "@/components/collections/catalog/catalog-items"
import { CatalogToolBarClient } from "@/components/collections/catalog/CatalogToolBarClient"
import type { CatalogLabels } from "@/components/collections/catalog/CatalogToolBarClient"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { ProductCard } from "@/components/collections/products/ProductCard"
import type { ProductCardData } from "@/components/collections/products/product-card"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

function NavigationCard({
  title,
  imageId,
  href,
}: {
  title: string
  imageId: string | null
  href: string | null
}) {
  const card = (
    <Card className="h-full overflow-hidden p-0 transition-colors hover:bg-secondary/40">
      <div className="relative aspect-[16/10] bg-background">
        <DirectusImage
          alt={title}
          className="absolute inset-0 size-full"
          imgClassName="size-full object-cover"
          sizing="fill"
          src={imageId}
          variant="original"
        />
      </div>
      <CardHeader className="p-5">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
    </Card>
  )
  return href ? (
    <Link
      className="block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      href={href}
    >
      {card}
    </Link>
  ) : (
    card
  )
}

export function ProductCatalogClients({
  items,
  hierarchy,
  labels,
  navigationLabels,
  emptyCatalog,
  noMatches,
  clearLabel,
}: {
  items: ProductCardData[]
  hierarchy: CatalogHierarchy[]
  labels: CatalogLabels
  navigationLabels: { categories: string; untypedProducts: string }
  emptyCatalog: string
  noMatches: string
  clearLabel: string
}) {
  const options = { history: "push" as const, scroll: false, shallow: false }
  const [categorySlug] = useQueryState(
    "cat",
    parseAsString.withDefault("").withOptions(options)
  )
  const [typeSlug] = useQueryState(
    "type",
    parseAsString.withDefault("").withOptions(options)
  )
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ ...options, history: "replace", shallow: true })
  )
  const category = hierarchy.find((row) => row.slug === categorySlug)
  const productType = category?.types.find((row) => row.slug === typeSlug)
  const stage = getCatalogNavigationStage(categorySlug, typeSlug)
  const validProductsStage =
    stage === "products" && category && (productType || typeSlug === "sin-tipo")
  const scopedItems = validProductsStage
    ? items.filter(
        (item) =>
          item.categoryId === category.id &&
          (typeSlug === "sin-tipo"
            ? !item.productTypeId
            : item.productTypeId === productType?.id)
      )
    : items

  if (stage === "categories" || !category) {
    return (
      <div className="flex flex-col gap-6">
        <Input
          aria-label={labels.search.label}
          onChange={(event) => void setQuery(event.target.value || null)}
          placeholder={labels.search.placeholder}
          type="search"
          value={query}
        />
        {query ? (
          <CatalogBodyClient
            clearLabel={clearLabel}
            emptyCatalog={emptyCatalog}
            items={items}
            noMatches={noMatches}
            pageSize={24}
            paginated
            renderItem={(item) => <ProductCard data={item} />}
            shallow={false}
          />
        ) : null}
        <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hierarchy.map((row) => (
            <li key={row.id}>
              <NavigationCard
                title={row.title}
                imageId={row.imageId}
                href={
                  row.slug
                    ? `/tienda?cat=${encodeURIComponent(row.slug)}`
                    : null
                }
              />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/tienda">
              {navigationLabels.categories}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {stage === "types" ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{category.title}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/tienda?cat=${encodeURIComponent(category.slug ?? "")}`}
                >
                  {category.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {productType?.title ?? navigationLabels.untypedProducts}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {stage === "types" || !validProductsStage ? (
        <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.types.map((row) => (
            <li key={row.id}>
              <NavigationCard
                title={row.title}
                imageId={row.imageId}
                href={`/tienda?cat=${encodeURIComponent(category.slug ?? "")}&type=${encodeURIComponent(row.slug)}`}
              />
            </li>
          ))}
          {category.untypedProductCount > 0 ? (
            <li>
              <NavigationCard
                title={navigationLabels.untypedProducts}
                imageId={null}
                href={`/tienda?cat=${encodeURIComponent(category.slug ?? "")}&type=sin-tipo`}
              />
            </li>
          ) : null}
        </ul>
      ) : (
        <>
          <CatalogToolBarClient
            items={scopedItems}
            labels={labels}
            paginated
            shallow={false}
          />
          <CatalogBodyClient
            clearLabel={clearLabel}
            emptyCatalog={emptyCatalog}
            items={scopedItems}
            noMatches={noMatches}
            pageSize={24}
            paginated
            renderItem={(item) => <ProductCard data={item} />}
            shallow={false}
          />
        </>
      )}
    </div>
  )
}
