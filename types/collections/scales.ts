import type { ClientsTypes } from "@/types/collections/clients"

export interface ScalesTypes {
  id: string
  title: string
  serial_number: string | null
  identification: string | null
  status: string | null
  client: string | ClientsTypes | null
}
