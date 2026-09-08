import type { FeaturedServicesBlockServicesJunction } from "@/types/collections/junctions/featured-services-block-services"

export interface FeaturedServicesBlock {
  // General
  id: string
  sort: number | null
  title: string
  excerpt: string | null
  services: number[] | FeaturedServicesBlockServicesJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
