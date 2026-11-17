"use client"

import Link from "next/link"
import { useQueryState, parseAsString } from "nuqs"
import { CatalogBodyClient } from "@/components/collections/catalog/CatalogBodyClient"
import {
  findCatalogHierarchyCategory,
  getCatalogCategoryParam,
  getCatalogNavigationStage,
  type CatalogHierarchy,
} from "@/components/collections/catalog/catalog-items"
import { CatalogToolBarClient } from "@/components/collections/catalog/CatalogToolBarClient"
import type { CatalogLabels } from "@/components/collections/catalog/CatalogToolBarClient"
import { fuzzySearch } from "@/config/search"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { ProductCard } from "@/components/collections/products/ProductCard"
import type { ProductCardData } from "@/components/collections/products/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription } from "@/components/ui/empty"
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
  icon,
  href,
}: {
  title: string
  imageId: string | null
  icon?: string | null
  href: string | null
}) {
  const card = (
    <Card className="h-full overflow-hidden p-0 transition-colors hover:bg-secondary/40">
      <div className="relative aspect-[16/10] bg-background">
        {imageId ? (
          <DirectusImage
            alt={title}
            className="absolute inset-0 size-full"
            imgClassName="size-full object-cover"
            sizing="fill"
            src={imageId}
            variant="original"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-secondary/30"
          >
            <MaterialIcon name={icon || "category"} size={48} />
          </div>
        )}
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

function CategoryTypes({
  category,
  labels,
}: {
  category: CatalogHierarchy
  labels: { untypedProducts: string; emptyCategory: string }
}) {
  if (category.types.length === 0 && category.untypedProductCount === 0) {
    return (
      <Empty className="items-start border-0 p-0 text-left">
        <EmptyDescription>{labels.emptyCategory}</EmptyDescription>
      </Empty>
    )
  }

  return (
    <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {category.types.map((row) => (
        <li key={row.id}>
          <NavigationCard
            href={`/tienda?cat=${encodeURIComponent(getCatalogCategoryParam(category))}&type=${encodeURIComponent(row.slug)}`}
            icon={row.icon}
            imageId={row.imageId}
            title={row.title}
          />
        </li>
      ))}
      {category.untypedProductCount > 0 ? (
        <li>
          <NavigationCard
            icon="inventory_2"
            title={labels.untypedProducts}
            imageId={null}
            href={`/tienda?cat=${encodeURIComponent(getCatalogCategoryParam(category))}&type=sin-tipo`}
          />
        </li>
      ) : null}
    </ul>
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
  navigationLabels: {
    categories: string
    untypedProducts: string
    emptyCategory: string
    searchLabel: string
    searchPlaceholder: string
  }
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
  const category = findCatalogHierarchyCategory(hierarchy, categorySlug)
  const productType = category?.types.find((row) => row.slug === typeSlug)
  const stage = getCatalogNavigationStage(categorySlug, typeSlug)
  const validProductsStage =
    stage === "products" && category && (productType || typeSlug === "sin-tipo")
  const isCategoryStage = stage === "types" || !validProductsStage
  const scopedItems = validProductsStage
    ? items
        .filter(
          (item) =>
            item.categoryId === category.id &&
            (typeSlug === "sin-tipo"
              ? !item.productTypeId
              : item.productTypeId === productType?.id)
        )
        .map((item) =>
          category.slug
            ? item
            : {
                ...item,
                categoryAncestors: [
                  ...(item.categoryAncestors ?? []),
                  getCatalogCategoryParam(category),
                ],
              }
        )
    : items

  if (stage === "categories" || !category) {
    const matches = fuzzySearch(hierarchy, query, { keys: ["title"] })

    return (
      <div className="flex flex-col gap-6">
        <Input
          aria-label={navigationLabels.searchLabel}
          onChange={(event) => void setQuery(event.target.value || null)}
          placeholder={navigationLabels.searchPlaceholder}
          type="search"
          value={query}
        />
        {query && matches.length === 0 ? (
          <Empty className="items-start border-0 p-0 text-left">
            <EmptyDescription>{noMatches}</EmptyDescription>
            <Button onPress={() => void setQuery(null)} variant="outline">
              {clearLabel}
            </Button>
          </Empty>
        ) : (
          <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((row) => (
              <li key={row.id}>
                <NavigationCard
                  title={row.title}
                  imageId={row.imageId}
                  href={`/tienda?cat=${encodeURIComponent(getCatalogCategoryParam(row))}`}
                />
              </li>
            ))}
          </ul>
        )}
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
          {isCategoryStage ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{category.title}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/tienda?cat=${encodeURIComponent(getCatalogCategoryParam(category))}`}
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
      {isCategoryStage ? (
        <CategoryTypes category={category} labels={navigationLabels} />
      ) : (
        <>
          <CatalogToolBarClient
            items={scopedItems}
            labels={labels}
            paginated
            shallow={false}
            showCategoryFilter={false}
            showProductFilters
          />
          <CatalogBodyClient
            clearLabel={clearLabel}
            emptyCatalog={emptyCatalog}
            items={scopedItems}
            noMatches={noMatches}
            pageSize={24}
            paginated
            productFilters
            renderItem={(item) => <ProductCard data={item} />}
            shallow={false}
          />
        </>
      )}
    </div>
  )
}
