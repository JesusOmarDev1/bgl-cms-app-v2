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

export function ManualCard({ data }: { data: ManualCardData }) {
  if (!data.id) {
    return null
  }

  return (
    <Link
      className="block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      href={`/manuales/${data.slug}`}
    >
      <Card className="h-full pt-0 transition-colors hover:bg-secondary/40 has-[a:focus-visible]:bg-secondary/40">
        {data.imageId ? (
          <DirectusImage
            alt={data.title}
            className="aspect-[4/3] w-full bg-background"
            imgClassName="h-full w-full"
            sizing="contained"
            src={data.imageId}
            style={{ height: "100%", objectFit: "contain", width: "100%" }}
            variant="original"
          />
        ) : null}
        <CardHeader>
          {data.title ? (
            <CardTitle className="text-2xl md:text-3xl">{data.title}</CardTitle>
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
        <div className="mt-auto flex items-end justify-between gap-3 px-8">
          <div className="flex min-w-0 flex-col gap-2">
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
            <MaterialIcon
              aria-hidden
              className="text-foreground"
              name="arrow_outward"
              size={18}
            />
          ) : null}
        </div>
      </Card>
    </Link>
  )
}
