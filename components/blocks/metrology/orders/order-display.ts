import type { useTranslations } from "next-intl"
import type { OrdersQueryResult } from "@/services/domain/db/repositories/collections/order"

export type OrdersTranslator = ReturnType<typeof useTranslations>

const dateFormat = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "America/Mexico_City",
})

export function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date)
}

export function statusLabel(status: string, t: OrdersTranslator) {
  if (status === "draft") return t("status.draft")
  if (status === "paid") return t("status.paid")
  return t("status.cancelled")
}

export function displayOrderDate(
  orders: OrdersQueryResult[number],
  t: OrdersTranslator
) {
  const client = typeof orders.client === "object" ? orders.client?.name : null
  const technicianRecord = orders.technician_name
  const technician =
    technicianRecord && typeof technicianRecord === "object"
      ? [technicianRecord.first_name, technicianRecord.last_name]
          .filter(Boolean)
          .join(" ")
      : null
  const scales = Array.isArray(orders.scales)
    ? orders.scales.flatMap((entry) => {
        if (
          typeof entry !== "object" ||
          entry === null ||
          !("scales_id" in entry)
        )
          return []
        const scale =
          typeof entry.scales_id === "object" ? entry.scales_id : null
        return scale
          ? [[scale.title, scale.serial_number].filter(Boolean).join(" · ")]
          : []
      })
    : []
  return {
    client: client || t("missingValue"),
    technician: technician || t("missingValue"),
    scales,
  }
}
