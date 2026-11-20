import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "cn"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import type { OrdersQueryResult } from "@/services/domain/db/repositories/collections/order"
import {
  displayOrderDate,
  formatDate,
  statusLabel,
  type OrdersTranslator,
} from "./order-display"
import type { OrdersSorting } from "./orders-columns"

export function OrdersListView({
  orders,
  t,
  className,
  sortBy,
  sortDirection,
  onSortChange,
}: {
  orders: OrdersQueryResult
  t: OrdersTranslator
  className: string
  sortBy: OrdersSorting["sortBy"]
  sortDirection: OrdersSorting["sortDirection"]
  onSortChange: (sorting: OrdersSorting) => void
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("sorting.label")}>
        {(["folio", "date_created"] as const).map((field) => {
          const selected = sortBy === field
          const label = t(`fields.${field === "folio" ? "folio" : "date"}`)
          const direction = selected ? sortDirection : "asc"
          return (
            <Button
              key={field}
              type="button"
              size="sm"
              variant={selected ? "secondary" : "outline"}
              aria-label={t("sorting.byField", {
                field: label,
                direction: t(`sorting.${direction === "asc" ? "ascending" : "descending"}`),
              })}
              aria-pressed={selected}
              onPress={() =>
                onSortChange({
                  sortBy: field,
                  sortDirection:
                    selected && sortDirection === "asc" ? "desc" : "asc",
                })
              }
            >
              {label}
              <MaterialIcon
                name={direction === "asc" ? "arrow_upward" : "arrow_downward"}
                fill={0}
                data-icon="inline-end"
              />
            </Button>
          )
        })}
      </div>
      <ItemGroup className="gap-3" aria-label={t("list.label")}>
      {orders.map((order) => {
        const values = displayOrderDate(order, t)
        return (
          <Item key={order.id} variant="outline" className="items-start">
            <ItemContent className="min-w-0 gap-3">
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                <ItemTitle className="max-w-full break-all tabular-nums">
                  {order.folio || t("missingValue")}
                </ItemTitle>
                <Badge variant="outline">
                  {statusLabel(order.status, t)}
                </Badge>
              </div>
              <ItemDescription>
                {t("fields.date")}: {formatDate(order.date_created)}
              </ItemDescription>
              <ItemDescription>
                {t("fields.client")}: {values.client}
              </ItemDescription>
              <ItemDescription>
                {t("fields.scales")}:{" "}
                {values.scales.length
                  ? values.scales.join(", ")
                  : t("missingValue")}
              </ItemDescription>
              <ItemDescription>
                {t("fields.technician")}: {values.technician}
              </ItemDescription>
            </ItemContent>
          </Item>
        )
      })}
      </ItemGroup>
    </div>
  )
}
