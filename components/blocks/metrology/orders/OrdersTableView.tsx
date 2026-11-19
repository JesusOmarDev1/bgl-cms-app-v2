import { useMemo } from "react"
import {
  useTable,
  type SortingState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { OrdersQueryResult } from "@/services/domain/db/repositories/collections/order"
import type { OrdersTranslator } from "./order-display"
import {
  createOrdersColumns,
  ordersTableFeatures,
  type OrdersSorting,
} from "./orders-columns"

export function OrdersTableView({
  orders,
  sortBy,
  sortDirection,
  onSortChange,
  t,
}: {
  orders: OrdersQueryResult
  sortBy: OrdersSorting["sortBy"]
  sortDirection: OrdersSorting["sortDirection"]
  onSortChange: (sorting: OrdersSorting) => void
  t: OrdersTranslator
}) {
  const columns = useMemo(() => createOrdersColumns(t), [t])
  const sorting: SortingState = [
    { id: sortBy, desc: sortDirection === "desc" },
  ]
  const table = useTable({
    features: ordersTableFeatures,
    columns,
    data: orders,
    state: { sorting },
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater
      const next = nextSorting[0]
      if (next && (next.id === "folio" || next.id === "date_created")) {
        onSortChange({
          sortBy: next.id,
          sortDirection: next.desc ? "desc" : "asc",
        })
      }
    },
    manualSorting: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
  })
  const headerGroup = table.getHeaderGroups()[0]

  return (
    <Table aria-label={t("table.label")} className="min-w-[52rem]">
      <TableHeader columns={headerGroup.headers}>
        {(header) => {
          const direction = header.column.getIsSorted()
          return (
            <TableHead
              id={header.column.id}
              aria-sort={
                direction === "asc"
                  ? "ascending"
                  : direction === "desc"
                    ? "descending"
                    : "none"
              }
            >
              {header.isPlaceholder ? null : (
                <table.FlexRender header={header} />
              )}
            </TableHead>
          )
        }}
      </TableHeader>
      <TableBody items={table.getRowModel().rows}>
        {(row) => (
          <TableRow id={row.id} columns={row.getAllCells()}>
            {(cell) => (
              <TableCell
                id={cell.column.id}
                className={
                  cell.column.id === "folio"
                    ? "max-w-48 font-medium break-all whitespace-normal tabular-nums"
                    : cell.column.id === "date_created"
                      ? "tabular-nums"
                      : cell.column.id === "scales"
                        ? "max-w-64 whitespace-normal"
                        : "whitespace-normal"
                }
              >
                <table.FlexRender cell={cell} />
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
