"use client"

import Link from "next/link"
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
import type { CatalogItem } from "@/components/collections/catalog/catalog-items"
import { formatDateShort } from "@/lib/formatting/format-date"

export type ManualCardData = CatalogItem & {
  slug: string | null
  imageId: string | null
}

function createdLabel(value: string): string | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return formatDateShort(date)
}

export function ManualCard({ manual }: { manual: ManualCardData }) {
  const created = createdLabel(manual.dateCreated)
  const href = manual.slug ? `/manuales/${manual.slug}` : null
  const card = (
    <Card className="h-full">
      {manual.imageId ? (
        <DirectusImage
          alt={manual.title}
          className="aspect-[4/3] w-full bg-background"
          imgClassName="h-full w-full"
          sizing="contained"
          src={manual.imageId}
          style={{ height: "100%", objectFit: "contain", width: "100%" }}
          variant="original"
        />
      ) : null}
      <CardHeader>
        {manual.title ? (
          <CardTitle className="text-xl md:text-2xl lg:text-2xl">
            {manual.title}
          </CardTitle>
        ) : null}
        {manual.excerpt ? (
          <CardDescription>
            <SafeHtml
              className="line-clamp-2"
              content={manual.excerpt}
              preset="compact"
            />
          </CardDescription>
        ) : null}
      </CardHeader>
      <div className="mt-auto flex items-end justify-between gap-3 px-8">
        <div className="flex min-w-0 flex-col gap-2">
          {manual.categoryTitle ? (
            <Badge variant="secondary">{manual.categoryTitle}</Badge>
          ) : null}
          {created ? (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MaterialIcon name="calendar_today" size={14} />
              <time dateTime={manual.dateCreated}>{created}</time>
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
