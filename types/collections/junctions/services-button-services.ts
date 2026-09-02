import type { ServicesButtonType } from "@/types/singletons/services-button"
import type { ServicesTypes } from "@/types/collections/services"

export interface ServicesButtonServicesJunction {
  id: number
  services_button_id: string | ServicesButtonType
  item: string | ServicesTypes
  collection: "services"
}
