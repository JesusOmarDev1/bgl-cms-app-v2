import type { OrdersQueryResult } from "@/services/domain/db/repositories/collections/order"
import type { OrdersTranslator } from "./order-display"
import type { OrdersSorting } from "./orders-columns"
import { OrdersListView } from "./OrdersListView"
import { OrdersTableView } from "./OrdersTableView"

export function OrderViews({
  orders,
  selectedView,
  sortBy,
  sortDirection,
  onSortChange,
  t,
}: {
  orders: OrdersQueryResult
  selectedView: "table" | "list" | null
  sortBy: OrdersSorting["sortBy"]
  sortDirection: OrdersSorting["sortDirection"]
  onSortChange: (sorting: OrdersSorting) => void
  t: OrdersTranslator
}) {
  const listClass =
    selectedView === "table"
      ? "hidden"
      : selectedView === "list"
        ? "block"
        : "block md:hidden"
  const tableClass =
    selectedView === "list"
      ? "hidden"
      : selectedView === "table"
        ? "block"
        : "hidden md:block"

  return (
    <>
      <div
        className={`${tableClass} min-w-0 overflow-x-auto rounded-xl border border-border bg-card/30`}
      >
        <OrdersTableView
          orders={orders}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          t={t}
        />
      </div>
      <OrdersListView
        className={listClass}
        orders={orders}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        t={t}
      />
    </>
  )
}
