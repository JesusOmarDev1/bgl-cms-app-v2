import type { ClientsBlockClientsJunction } from "@/types/collections/junctions/clients-block-clients"

export interface ClientsBlock {
  // General
  id: string
  title: string
  excerpt: string | null
  sort: number | null
  clients: number[] | ClientsBlockClientsJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
