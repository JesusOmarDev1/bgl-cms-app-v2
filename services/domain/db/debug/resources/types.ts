import type { BrandsBlock } from "@/types/blocks/content/brands-block"
import type { ContentBlock } from "@/types/blocks/content/html/content-block"
import type { ContentColumnBlock } from "@/types/blocks/content/html/content-column-block"
import type { HeroBlock } from "@/types/blocks/content/hero-block"
import type { LogosClientsBlock } from "@/types/blocks/content/logos-clients-block"
import type { DivisionServicesBlock } from "@/types/blocks/content/services/division-services-block"
import type { FormBlock } from "@/types/blocks/form/form-block"
import type { PagesTypes } from "@/types/collections/pages"

export const DEBUG_RESOURCE_KINDS = [
  "singleton",
  "collections",
  "endpoints",
] as const

export type DebugKind = (typeof DEBUG_RESOURCE_KINDS)[number]

export type DebugResourceDefinition = {
  readonly kind: DebugKind
  readonly key: string
  readonly label: string
  readonly labelKey: `resources.${string}`
}

export type DebugPagesExpandedPayload = PagesTypes[]

export interface DebugPagesExpansionCoverage {
  formFields: FormBlock["fields"]
  logosClients: LogosClientsBlock["clients"]
  contentColumns: ContentBlock["content"]
  heroImages: HeroBlock["images"]
  heroBrands: HeroBlock["brands"]
  brands: BrandsBlock["brands"]
  divisionServices: DivisionServicesBlock["division_services"]
  contentColumnBlock: ContentColumnBlock
}
