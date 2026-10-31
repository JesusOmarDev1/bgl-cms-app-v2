"use client"

import {
  useCallback,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import {
  filterCatalogProducts,
  type CatalogItem,
} from "@/components/collections/catalog/catalog-items"
import { useCatalogParams } from "@/components/collections/catalog/useCatalogParams"
import { Box } from "@/components/shared/content/Box"
import { Button } from "@/components/ui/button"
import InfiniteScroll from "@/components/shared/utility/InfiniteScroll"
import { Empty, EmptyDescription } from "@/components/ui/empty"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

function columnCount() {
  if (window.matchMedia("(min-width: 1024px)").matches) return 3
  if (window.matchMedia("(min-width: 640px)").matches) return 2
  return 1
}

function subscribeColumns(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange)
  return () => window.removeEventListener("resize", onStoreChange)
}

function useColumnCount() {
  return useSyncExternalStore(subscribeColumns, columnCount, () => 1)
}

function CatalogGrid<T extends CatalogItem>({
  columns,
  items,
  renderItem,
}: {
  columns: number
  items: readonly T[]
  renderItem: (item: T) => ReactNode
}) {
  const [floor, setFloor] = useState(0)
  const visible = Math.max(floor, columns)
  const reveal = useCallback(() => {
    setFloor((current) => Math.max(current, columns) + columns)
  }, [columns])
  const shown = items.slice(0, visible)

  return (
    <InfiniteScroll
      hasMore={shown.length < items.length}
      isLoading={false}
      next={reveal}
      showSpinner={false}
    >
      <Box
        className="list-none"
        cols={{ base: 1, sm: 2, lg: 3 }}
        display="grid"
        gap={2}
        render={(props) => <ul {...props} />}
      >
        {shown.map((item) => (
          <li className="min-w-0" key={item.id}>
            {renderItem(item)}
          </li>
        ))}
      </Box>
    </InfiniteScroll>
  )
}

export function CatalogBodyClient<T extends CatalogItem>({
  items,
  renderItem,
  emptyCatalog,
  noMatches,
  clearLabel,
  shallow = true,
  pageSize,
  paginated = false,
}: {
  items: readonly T[]
  renderItem: (item: T) => ReactNode
  emptyCatalog: string
  noMatches: string
  clearLabel: string
  shallow?: boolean
  pageSize?: number
  paginated?: boolean
}) {
  const { q, cat, sort, page, setPage, clearFilters } = useCatalogParams(
    shallow,
    paginated
  )
  const columns = useColumnCount()

  if (items.length === 0) {
    return (
      <Empty className="items-start border-0 p-0 text-left">
        <EmptyDescription>{emptyCatalog}</EmptyDescription>
      </Empty>
    )
  }

  const matches = filterCatalogProducts(items, q, cat, sort)
  if (matches.length === 0) {
    return (
      <Empty className="items-start border-0 p-0 text-left">
        <EmptyDescription>{noMatches}</EmptyDescription>
        <Button onPress={clearFilters} variant="outline">
          {clearLabel}
        </Button>
      </Empty>
    )
  }

  if (pageSize === undefined) {
    return (
      <CatalogGrid
        columns={columns}
        items={matches}
        key={`${q}\0${cat}\0${sort}`}
        renderItem={renderItem}
      />
    )
  }

  const itemsPerPage = pageSize ?? Math.max(matches.length, 1)
  const pageCount = Math.ceil(matches.length / itemsPerPage)
  const currentPage = Math.min(Math.max(page, 1), pageCount)
  const shown = matches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="flex flex-col gap-6">
      <Box
        className="list-none"
        cols={{ base: 1, sm: 2, lg: 3 }}
        display="grid"
        gap={2}
        render={(props) => <ul {...props} />}
      >
        {shown.map((item) => (
          <li className="min-w-0" key={item.id}>
            {renderItem(item)}
          </li>
        ))}
      </Box>
      {pageCount > 1 ? (
        <Pagination aria-label="Paginación de productos">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={currentPage <= 1}
                href={`?page=${Math.max(currentPage - 1, 1)}`}
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage > 1) void setPage(currentPage - 1)
                }}
                text="Anterior"
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 text-sm text-muted-foreground">
                {currentPage} / {pageCount}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                aria-disabled={currentPage >= pageCount}
                href={`?page=${Math.min(currentPage + 1, pageCount)}`}
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage < pageCount) void setPage(currentPage + 1)
                }}
                text="Siguiente"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}
