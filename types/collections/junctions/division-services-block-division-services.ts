import type { DivisionServicesBlock } from "@/types/blocks/content/services/division-services-block"
import type { DivisionServicesTypes } from "@/types/collections/division-services"

export interface DivisionServicesBlockDivisionServicesJunction {
  id: number
  division_services_block_id: string | DivisionServicesBlock
  division_services_id: string | DivisionServicesTypes
}
