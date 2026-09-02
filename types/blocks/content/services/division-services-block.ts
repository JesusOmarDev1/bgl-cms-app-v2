import type { DivisionServicesBlockDivisionServicesJunction } from "@/types/collections/junctions/division-services-block-division-services"

export interface DivisionServicesBlock {
  // General
  id: string
  sort: number | null
  title: string
  excerpt: string | null
  division_services: number[] | DivisionServicesBlockDivisionServicesJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
