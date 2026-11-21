"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useQueryState, parseAsString } from "nuqs"
import { CatalogBodyClient } from "@/components/collections/catalog/CatalogBodyClient"
import {
  filterCatalogProducts,
  findCatalogHierarchyCategory,
  getCatalogCategoryParam,
  getCatalogNavigationStage,
  type CatalogHierarchy,
} from "@/components/collections/catalog/catalog-items"
import { CatalogToolBarClient } from "@/components/collections/catalog/CatalogToolBarClient"
import type { CatalogLabels } from "@/components/collections/catalog/CatalogToolBarClient"
import { useCatalogParams } from "@/components/collections/catalog/useCatalogParams"
import { fuzzySearch } from "@/config/search"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { ProductCard } from "@/components/collections/products/ProductCard"
import type { ProductCardData } from "@/components/collections/products/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  badge,
  chips,
}: {
  title: string
  imageId: string | null
  icon?: string | null
  href: string | null
  badge?: string
  chips?: string[]
}) {
  const card = (
    <Card className="relative h-full overflow-hidden p-0 transition-[transform,box-shadow,background-color] hover:bg-secondary/40 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg motion-reduce:transition-none">
      {badge ? (
        <Badge
          className="absolute top-3 right-3 z-10 bg-background/80 tabular-nums"
          variant="outline"
        >
          {badge}
        </Badge>
      ) : null}
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
        <CardTitle className="text-xl text-balance">{title}</CardTitle>
        {chips && chips.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" data-slot="type-chips">
            {chips.map((chip) => (
              <li key={chip}>
                <Badge variant="secondary">{chip}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
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
            href={`/productos?cat=${encodeURIComponent(getCatalogCategoryParam(category))}&type=${encodeURIComponent(row.slug)}`}
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
            href={`/productos?cat=${encodeURIComponent(getCatalogCategoryParam(category))}&type=sin-tipo`}
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
  const filters = useCatalogParams()
  const catalog = useTranslations("catalog")
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
    const groups = [
      {
        heading: catalog("categories_with_products"),
        rows: matches.filter((row) => row.productCount > 0),
      },
      {
        heading: catalog("more_categories"),
        rows: matches.filter((row) => row.productCount === 0),
      },
    ].filter((group) => group.rows.length > 0)

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
          groups.map((group) => (
            <section className="flex flex-col gap-3" key={group.heading}>
              <h2 className="text-base font-semibold text-muted-foreground">
                {group.heading}
              </h2>
              <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.rows.map((row) => (
                  <li key={row.id}>
                    <NavigationCard
                      badge={
                        row.productCount > 0
                          ? catalog("product_count", {
                              count: row.productCount,
                            })
                          : catalog("empty_category_badge")
                      }
                      chips={
                        row.productCount > 0
                          ? row.types.map((type) => type.title)
                          : undefined
                      }
                      href={`/productos?cat=${encodeURIComponent(getCatalogCategoryParam(row))}`}
                      icon={row.icon}
                      imageId={row.imageId}
                      title={row.title}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    )
  }

  const catalogMatches = isCategoryStage
    ? []
    : filterCatalogProducts(
        scopedItems,
        filters.q,
        categorySlug,
        filters.sort,
        {
          brand: filters.brand,
          capacity: filters.capacity,
          division: filters.division,
        }
      )

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/productos">
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
                  href={`/productos?cat=${encodeURIComponent(getCatalogCategoryParam(category))}`}
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
          <div className="flex flex-col gap-3">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              <strong className="font-semibold text-foreground tabular-nums">
                {catalogMatches.length}
              </strong>{" "}
              {catalog("results_count", {
                count: catalogMatches.length,
                type: productType?.title ?? navigationLabels.untypedProducts,
                category: category.title,
              })}
            </p>
            <CatalogToolBarClient
              items={scopedItems}
              labels={labels}
              paginated
              shallow={false}
              showCategoryFilter={false}
              showProductFilters
            />
          </div>
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
