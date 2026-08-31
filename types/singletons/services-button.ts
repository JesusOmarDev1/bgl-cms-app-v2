import type { ServicesButtonServicesJunction } from "@/types/collections/junctions/services-button-services"

export interface ServicesButtonType {
  // General
  id: string
  title: string
  excerpt: string | null
  services: number[] | ServicesButtonServicesJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
