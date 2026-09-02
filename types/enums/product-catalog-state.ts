export const ProductCatalogStateEnum = [
  "active",
  "discontinued",
  "out_of_stock",
  "coming_soon",
] as const
export type ProductCatalogState = (typeof ProductCatalogStateEnum)[number]
