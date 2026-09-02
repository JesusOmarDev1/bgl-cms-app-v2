import type { BrandsTypes } from "@/types/collections/brands"
import type { ModelsTypes } from "@/types/collections/models"

export interface BrandsModelsJunction {
  id: number
  brands_id: string | BrandsTypes
  models_id: string | ModelsTypes
}
