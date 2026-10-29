import { connection } from "next/server"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ProductCard } from "@/components/collections/products/ProductCard"
import { ProductAttributes } from "@/components/collections/products/detail/ProductAttributes"
import { ProductGallery } from "@/components/collections/products/detail/ProductGallery"
import { groupAttributes } from "@/components/collections/products/detail/group-attributes"
import { toProductCard } from "@/components/collections/products/to-product-card"
import { GoBackBtn } from "@/components/shared/content/GoBackBtn"
import { MiddleTruncation } from "@/components/shared/content/MiddleTruncation"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import Share from "@/components/shared/content/Share"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { WEBSITE_URL } from "@/lib/env/constants"
import { sanitizeHtml } from "@/lib/formatting/sanitize"
import { getProductBySlugRepository } from "@/services/domain/db/repositories/collections/products"
import type { ProductsQueryResult } from "@/services/domain/db/queries/collections/products/products"
import type { ProductAttributeGroup } from "@/types/enums/product-attribute-group"
import type { ProductEquipmentType } from "@/types/enums/product-equipment-type"

type ProductRow = ProductsQueryResult[number]

function equipmentLabel(
  t: Awaited<ReturnType<typeof getTranslations<"products">>>,
  value: ProductEquipmentType
): string {
  switch (value) {
    case "scale":
      return t("equipment.scale")
    case "consumables":
      return t("equipment.consumables")
    case "indicator":
      return t("equipment.indicator")
    case "labeling_indicator":
      return t("equipment.labeling_indicator")
  }
}

function groupLabel(
  t: Awaited<ReturnType<typeof getTranslations<"products">>>,
  group: ProductAttributeGroup
): string {
  switch (group) {
    case "general":
      return t("groups.general")
    case "specs":
      return t("groups.specs")
    case "functions":
      return t("groups.functions")
    case "others":
      return t("groups.others")
  }
}

function unitLabel(
  t: Awaited<ReturnType<typeof getTranslations<"products">>>,
  unit: string | null | undefined
): string | null {
  switch (unit) {
    case "kilograms":
      return t("units.kilograms")
    case "grams":
      return t("units.grams")
    case "pounds":
      return t("units.pounds")
    case "milligrams":
      return t("units.milligrams")
    case "micrograms":
      return t("units.micrograms")
    case "nanograms":
      return t("units.nanograms")
    case "liters":
      return t("units.liters")
    case "gallons":
      return t("units.gallons")
    case "meters":
      return t("units.meters")
    case "centimeters":
      return t("units.centimeters")
    case "amperes":
      return t("units.amperes")
    case "volts":
      return t("units.volts")
    case "kelvins":
      return t("units.kelvins")
    case "seconds":
      return t("units.seconds")
    case "minutes":
      return t("units.minutes")
    case "hours":
      return t("units.hours")
    default:
      return null
  }
}

function readSpecs(
  t: Awaited<ReturnType<typeof getTranslations<"products">>>,
  product: ProductRow
) {
  const specs: {
    id: string
    title: string
    value: string
    unit: string | null
    group: ProductAttributeGroup
  }[] = []
  for (const row of product.attributes ?? []) {
    const attribute = row.product_attributes_id
    if (!attribute || typeof attribute === "string") continue
    const value = sanitizeHtml(attribute.value).trim()
    if (!value) continue
    specs.push({
      id: attribute.id,
      title: attribute.title,
      value,
      unit: unitLabel(t, attribute.units),
      group: attribute.group,
    })
  }
  return specs
}

function readRelated(product: ProductRow) {
  const related: { id: number; card: ReturnType<typeof toProductCard> }[] = []
  for (const row of product.related_products ?? []) {
    const relatedProduct = row.related_products_id
    if (!relatedProduct || typeof relatedProduct === "string") continue
    related.push({ id: row.id, card: toProductCard(relatedProduct) })
  }
  return related
}

function galleryImages(product: ProductRow): { id: string; alt: string }[] {
  const images: { id: string; alt: string }[] = []
  const seen = new Set<string>()
  const add = (id: string | null | undefined) => {
    if (!id || seen.has(id)) return
    seen.add(id)
    images.push({ id, alt: product.title })
  }
  if (product.image && typeof product.image !== "string") add(product.image.id)
  for (const row of product.images ?? []) {
    const file = row.directus_files_id
    if (file && typeof file !== "string") add(file.id)
  }
  return images
}

export async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const rows = await getProductBySlugRepository({ slug })
  const product = rows[0]
  if (!product) notFound()

  await connection()

  const t = await getTranslations("products")
  const card = toProductCard(product)
  const groups = groupAttributes(readSpecs(t, product)).map((group) => ({
    id: group.group,
    label: groupLabel(t, group.group),
    items: group.items,
  }))
  const related = readRelated(product)
  const kicker = [card.brand, card.model].filter((part): part is string =>
    Boolean(part)
  )
  const shareUrl = `${WEBSITE_URL}/tienda/producto/${slug}`

  return (
    <BoxContainer>
      <Box
        display="flex"
        gap={1.5}
        orientation="vertical"
        paddingBottom={3}
        paddingTop={2}
      >
        <GoBackBtn href="/tienda">{t("back_to_store")}</GoBackBtn>
        <Breadcrumb>
          <BreadcrumbList className="min-w-0 flex-nowrap text-base">
            <BreadcrumbItem className="shrink-0">
              <BreadcrumbLink href="/tienda">{t("title")}</BreadcrumbLink>
            </BreadcrumbItem>
            {product.equipment_type ? (
              <BreadcrumbItem className="shrink-0">
                <MiddleTruncation className="max-w-48">
                  {equipmentLabel(t, product.equipment_type)}
                </MiddleTruncation>
              </BreadcrumbItem>
            ) : null}
            {card.categoryTitle ? (
              <BreadcrumbItem className="shrink-0">
                <MiddleTruncation className="max-w-48">
                  {card.categoryTitle}
                </MiddleTruncation>
              </BreadcrumbItem>
            ) : null}
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="block max-w-full min-w-0">
                <MiddleTruncation className="max-w-full">
                  {product.title}
                </MiddleTruncation>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Box align="start" cols={{ base: 1, lg: 2 }} display="grid" gap={2}>
          <ProductGallery images={galleryImages(product)} />
          <Box display="flex" gap={1} orientation="vertical">
            {kicker.length > 0 ? (
              <p className="text-lg font-medium tracking-wide text-muted-foreground uppercase">
                {kicker.join(" | ")}
              </p>
            ) : null}
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              {product.title}
            </h1>
            {card.excerpt ? (
              <SafeHtml content={card.excerpt} preset="compact" />
            ) : null}
            <Share
              className="w-full"
              text={product.title}
              title={product.title}
              url={shareUrl}
              variant="red"
            />
          </Box>
        </Box>
        {card.description ? (
          <SafeHtml content={card.description} preset="article" />
        ) : null}
        <ProductAttributes groups={groups} />
        {related.length > 0 ? (
          <Box display="flex" gap={1} orientation="vertical">
            <h2 className="font-heading text-2xl font-semibold">
              {t("related")}
            </h2>
            <Box
              className="list-none"
              cols={{ base: 1, sm: 2, lg: 3 }}
              display="grid"
              gap={2}
              render={(props) => <ul {...props} />}
            >
              {related.map((item) => (
                <li className="min-w-0" key={item.id}>
                  <ProductCard product={item.card} />
                </li>
              ))}
            </Box>
          </Box>
        ) : null}
      </Box>
    </BoxContainer>
  )
}
