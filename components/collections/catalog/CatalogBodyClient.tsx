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
import InfiniteScroll from "@/components/shared/utility/InfiniteScroll"
import { Button } from "@/components/ui/button"

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
}: {
  items: readonly T[]
  renderItem: (item: T) => ReactNode
  emptyCatalog: string
  noMatches: string
  clearLabel: string
}) {
  const { q, cat, sort, clearFilters } = useCatalogParams()
  const columns = useColumnCount()

  if (items.length === 0) {
    return <p className="text-muted-foreground">{emptyCatalog}</p>
  }

  const matches = filterCatalogProducts(items, q, cat, sort)
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-muted-foreground">{noMatches}</p>
        <Button onPress={clearFilters} variant="outline">
          {clearLabel}
        </Button>
      </div>
    )
  }

  return (
    <CatalogGrid
      columns={columns}
      items={matches}
      key={`${q}\0${cat}\0${sort}`}
      renderItem={renderItem}
    />
  )
}
