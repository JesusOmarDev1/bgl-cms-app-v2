import { cents } from "@/lib/formatting/money"

// Relations must be expanded before passing an order to the view; IDs alone cannot fill it.
export interface ServiceOrderData {
  folio: string
  date_created: string
  client: {
    id: string
    name: string
    address?: string | null
    contact?: string | null
    city?: string | null
    state?: string | null
  }
  description: string
  technician_name: { first_name: string; last_name: string }
  client_name: string
  client_department: string | null
  technician_signature: { id: string }
  client_signature: { id: string }
  status: "draft" | "paid" | "cancelled"
  scales: {
    scales_id: {
      id: string
      client: { id: string }
      brand: { title: string }
      model: { title: string } | null
      serial_number: string | null
      capacity: number
      units: string
    }
  }[]
  parts: {
    quantity: number
    inventory_id: { title: string; price: string | number | null }
  }[]
  labor_cost: string | number | null
  overtime_cost: string | number | null
  travel_cost: string | number | null
  other_cost: string | number | null
  apply_vat: boolean
}

export function serviceOrderAmounts(data: ServiceOrderData) {
  const lines = data.parts.map(({ quantity, inventory_id }) => {
    if (!Number.isSafeInteger(quantity) || quantity <= 0)
      throw new Error("Invalid service order quantity")
    const price = cents(inventory_id.price)
    return { price, amount: price === null ? null : price * quantity }
  })
  const parts = lines.some((line) => line.amount === null)
    ? null
    : lines.reduce((sum, line) => sum + (line.amount ?? 0), 0)
  const charges = [
    data.labor_cost,
    data.overtime_cost,
    data.travel_cost,
    data.other_cost,
  ].map(cents)
  const hasAmount =
    data.parts.length > 0 || charges.some((charge) => charge !== null)
  const subtotal =
    parts === null || !hasAmount
      ? null
      : parts + charges.reduce<number>((sum, charge) => sum + (charge ?? 0), 0)
  const vat =
    subtotal !== null && data.apply_vat ? Math.round(subtotal * 0.16) : null
  return {
    lines,
    parts: data.parts.length ? parts : null,
    charges,
    subtotal,
    vat,
    total: subtotal === null ? null : subtotal + (vat ?? 0),
  }
}

export function assertScalesBelongToClient(data: ServiceOrderData) {
  if (
    !data.scales.length ||
    data.scales.some(({ scales_id }) => scales_id.client.id !== data.client.id)
  )
    throw new Error("Service order scales must belong to the selected client")
}
