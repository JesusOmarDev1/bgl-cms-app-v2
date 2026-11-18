import type { ClientsTypes } from "@/types/collections/clients"

export type OrderStatus = "draft" | "paid" | "cancelled"

export interface OrderTechnicianTypes {
  id: string
  first_name: string | null
  last_name: string | null
}

export interface OrderScaleTypes {
  id: string
  title: string
  serial_number: string | null
}

export interface OrderScalesJunctionTypes {
  id: number
  order_id: string | OrderTypes
  scales_id: string | OrderScaleTypes
  sort: number | null
}

export interface OrderTypes {
  id: string
  folio: string | null
  date_created: "datetime" | null
  description: string | null
  client_name: string | null
  client_department: string | null
  client: string | ClientsTypes | null
  technician_name: string | OrderTechnicianTypes | null
  scales: number[] | OrderScalesJunctionTypes[]
  status: OrderStatus
}
