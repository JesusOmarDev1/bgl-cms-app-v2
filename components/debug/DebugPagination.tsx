"use client"

import { useTranslations } from "next-intl"

import { serializeDebugSearchParams } from "@/app/debug/search-params"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getDebugPaginationItems } from "@/lib/debug/pagination-items"
import type { DebugKind } from "@/services/domain/db/debug/catalog"

type DebugPaginationProps = {
  kind: DebugKind
  resource: string
  page: number
  limit: number
  total: number
}

export function DebugPagination({
  kind,
  resource,
  page,
  limit,
  total,
}: DebugPaginationProps) {
  const t = useTranslations("debug")
  const totalPages = Math.ceil(total / limit)

  if (kind !== "collections" || totalPages <= 1) {
    return null
  }

  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const items = getDebugPaginationItems(currentPage, totalPages)
  const previousPage = Math.max(1, currentPage - 1)
  const nextPage = Math.min(totalPages, currentPage + 1)
  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  function hrefForPage(targetPage: number): string {
    return serializeDebugSearchParams("/debug", {
      kind,
      resource,
      page: targetPage,
      limit,
    })
  }

  return (
    <Pagination className="justify-start sm:justify-center">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hrefForPage(previousPage)}
            isDisabled={isFirstPage}
            text={t("pagination.previous")}
          />
        </PaginationItem>
        {items.map((item) => {
          if (item.type === "ellipsis") {
            return (
              <PaginationItem key={`ellipsis-${item.id}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          return (
            <PaginationItem key={`page-${item.page}`}>
              <PaginationLink
                href={hrefForPage(item.page)}
                isActive={item.page === currentPage}
                aria-label={t("pagination.page", { page: item.page })}
              >
                {item.page}
              </PaginationLink>
            </PaginationItem>
          )
        })}
        <PaginationItem>
          <PaginationNext
            href={hrefForPage(nextPage)}
            isDisabled={isLastPage}
            text={t("pagination.next")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
