import type { LogosClientsBlockClientsJunction } from "@/types/collections/junctions/logos-clients-block-clients"

export interface LogosClientsBlock {
  // General
  id: string
  sort: number | null
  title: string
  excerpt: string | null
  clients: number[] | LogosClientsBlockClientsJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
