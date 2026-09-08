import type { FeaturedServicesBlock } from "@/types/blocks/content/services/featured-services-block"
import type { ServicesTypes } from "@/types/collections/services"

export interface FeaturedServicesBlockServicesJunction {
  id: number
  featured_services_block_id: string | FeaturedServicesBlock
  services_id: string | ServicesTypes
}
