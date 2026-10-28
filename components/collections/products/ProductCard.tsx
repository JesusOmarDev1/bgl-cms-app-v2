"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ProductCardData } from "@/components/collections/products/product-card"
import { formatDateShort } from "@/lib/formatting/format-date"

function createdLabel(value: string): string | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return formatDateShort(date)
}

function brandLine(
  t: ReturnType<typeof useTranslations<"products">>,
  brand: string | null,
  model: string | null
): string | null {
  if (brand && model) return t("brand_model", { brand, model })
  if (brand) return t("brand", { brand })
  if (model) return t("model", { model })
  return null
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const t = useTranslations("products")
  const created = createdLabel(product.dateCreated)
  const line = brandLine(t, product.brand, product.model)
  const href = product.slug ? `/tienda/producto/${product.slug}` : null
  const card = (
    <Card className="h-full">
      {product.imageId ? (
        <DirectusImage
          alt={product.title}
          className="aspect-[4/3] w-full bg-background"
          imgClassName="h-full w-full"
          sizing="contained"
          src={product.imageId}
          style={{ height: "100%", objectFit: "contain", width: "100%" }}
          variant="original"
        />
      ) : null}
      <CardHeader>
        {product.title ? (
          <CardTitle className="text-xl md:text-2xl lg:text-2xl">
            {product.title}
          </CardTitle>
        ) : null}
        {line ? (
          <p className="text-sm text-muted-foreground">{line}</p>
        ) : null}
        {product.excerpt ? (
          <CardDescription>
            <SafeHtml
              className="line-clamp-2"
              content={product.excerpt}
              preset="compact"
            />
          </CardDescription>
        ) : null}
      </CardHeader>
      <div className="mt-auto flex items-end justify-between gap-3 px-8">
        <div className="flex min-w-0 flex-col gap-2">
          {product.categoryTitle ? (
            <Badge variant="secondary">{product.categoryTitle}</Badge>
          ) : null}
          {created ? (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MaterialIcon name="calendar_today" size={14} />
              <time dateTime={product.dateCreated}>{created}</time>
            </p>
          ) : null}
        </div>
        {href ? (
          <MaterialIcon aria-hidden name="arrow_forward" size={18} />
        ) : null}
      </div>
    </Card>
  )

  if (!href) return card

  return (
    <Link
      className="block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      href={href}
    >
      {card}
    </Link>
  )
}
