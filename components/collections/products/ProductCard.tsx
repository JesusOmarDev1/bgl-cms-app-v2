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
import { formatDateShort } from "@/lib/formatting/date"
import { Button } from "@/components/ui/button"

export function ProductCard({ data }: { data: ProductCardData }) {
  const t = useTranslations("products")
  const catalog = useTranslations("catalog")

  if (!data.id) {
    return null
  }

  // shortcut: capacity and division render in kg/g, upgrade when products expose their own units.
  const facets = [
    data.capacity == null
      ? ""
      : catalog("card_capacity", { value: data.capacity }),
    data.division == null
      ? ""
      : catalog("card_division", { value: data.division }),
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <Link
      className="block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      href={`/productos/${data.slug}`}
    >
      <Card className="h-full flex-row pt-0 transition-[transform,box-shadow,background-color] hover:bg-secondary/40 has-[a:focus-visible]:bg-secondary/40 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg motion-reduce:transition-none sm:flex-col">
        {data.imageId ? (
          <DirectusImage
            alt={data.title}
            className="w-24 shrink-0 bg-background sm:aspect-[4/3] sm:w-full"
            imgClassName="h-full w-full"
            sizing="contained"
            src={data.imageId}
            style={{ height: "100%", objectFit: "contain", width: "100%" }}
            variant="original"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex w-24 shrink-0 items-center justify-center bg-background sm:aspect-[4/3] sm:w-full"
          >
            <MaterialIcon
              className="text-muted-foreground"
              name={data.categoryIcon || "inventory_2"}
              size={48}
            />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-(--card-spacing) sm:contents">
          <CardHeader className="px-4 sm:px-8">
            {data.title ? (
              <CardTitle className="text-base leading-snug text-balance sm:text-2xl md:text-3xl">
                {data.title}
              </CardTitle>
            ) : null}
            {facets ? (
              <p className="text-sm text-muted-foreground tabular-nums">
                {facets}
              </p>
            ) : null}
            {data.model ? (
              <p className="text-sm text-muted-foreground">
                {t("model", { model: data.model })}
              </p>
            ) : null}
            {data.excerpt ? (
              <CardDescription>
                <SafeHtml
                  className="line-clamp-2"
                  content={data.excerpt}
                  preset="compact"
                />
              </CardDescription>
            ) : null}
          </CardHeader>
          <div className="mt-auto flex items-end justify-between gap-3 px-4 sm:px-8">
            <div className="flex min-w-0 flex-col gap-2">
              {data.brand ? (
                <Badge variant="secondary">
                  {t("brand", { brand: data.brand })}
                </Badge>
              ) : null}
              {data.categoryTitle ? (
                <Badge variant="secondary">{data.categoryTitle}</Badge>
              ) : null}
              {data.dateCreated ? (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MaterialIcon name="calendar_today" size={14} />
                  <time dateTime={data.dateCreated}>
                    {formatDateShort(data.dateCreated)}
                  </time>
                </p>
              ) : null}
            </div>
            {data.slug ? (
              <Button
                variant="secondary"
                size="icon-sm"
                aria-label="Ver producto"
              >
                <MaterialIcon
                  name="arrow_outward"
                  className="text-foreground"
                />
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  )
}
