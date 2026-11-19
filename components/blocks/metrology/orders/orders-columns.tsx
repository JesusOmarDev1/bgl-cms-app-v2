import {
  createColumnHelper,
  rowSortingFeature,
  tableFeatures,
  type CellData,
  type Column,
  type RowData,
} from "@tanstack/react-table"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { OrdersQueryResult } from "@/services/domain/db/repositories/collections/order"
import {
  displayOrderDate,
  formatDate,
  statusLabel,
  type OrdersTranslator,
} from "./order-display"

export const ordersTableFeatures = tableFeatures({ rowSortingFeature })
export type OrdersSortField = "date_created" | "folio"
export type OrdersSortDirection = "asc" | "desc"
export type OrdersSorting = {
  sortBy: OrdersSortField
  sortDirection: OrdersSortDirection
}

type Order = OrdersQueryResult[number]
const columnHelper = createColumnHelper<typeof ordersTableFeatures, Order>()

function SortableHeader<
  TData extends RowData,
  TValue extends CellData,
>({
  column,
  label,
}: {
  column: Column<typeof ordersTableFeatures, TData, TValue>
  label: string
}) {
  const sortDirection = column.getIsSorted()
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={label}
      onPress={column.getToggleSortingHandler()}
    >
      {label}
      <MaterialIcon
        name={
          sortDirection === "asc"
            ? "arrow_upward"
            : sortDirection === "desc"
              ? "arrow_downward"
              : "unfold_more"
        }
        fill={0}
        data-icon="inline-end"
      />
    </Button>
  )
}

export function createOrdersColumns(t: OrdersTranslator) {
  return columnHelper.columns([
    columnHelper.accessor("folio", {
      id: "folio",
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader column={column} label={t("fields.folio")} />
      ),
      cell: ({ row }) => row.original.folio || t("missingValue"),
    }),
    columnHelper.accessor("date_created", {
      id: "date_created",
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader column={column} label={t("fields.date")} />
      ),
      cell: ({ row }) => formatDate(row.original.date_created),
    }),
    columnHelper.display({
      id: "client",
      header: t("fields.client"),
      cell: ({ row }) => displayOrderDate(row.original, t).client,
    }),
    columnHelper.display({
      id: "scales",
      header: t("fields.scales"),
      cell: ({ row }) => {
        const scales = displayOrderDate(row.original, t).scales
        return scales.length ? scales.join(", ") : t("missingValue")
      },
    }),
    columnHelper.display({
      id: "technician",
      header: t("fields.technician"),
      cell: ({ row }) => displayOrderDate(row.original, t).technician,
    }),
    columnHelper.display({
      id: "status",
      header: t("fields.status"),
      cell: ({ row }) => (
        <Badge variant="outline">{statusLabel(row.original.status, t)}</Badge>
      ),
    }),
  ])
}
