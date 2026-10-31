export type ProductCardData = {
  id: string
  slug: string | null
  title: string
  excerpt: string | null
  description: string | null
  dateCreated: string
  imageId: string | null
  brand: string | null
  model: string | null
  categoryTitle: string | null
  categorySlug: string | null
  categoryIcon: string | null
  categoryAncestors?: readonly string[]
}

export type ProductCardSource = {
  id: string
  slug: string | null
  title: string
  excerpt: string | null
  description: string | null
  date_created: string
  image: { id: string } | null
  brand: { title: string } | null
  model: { title: string } | null
  product_category: {
    title: string
    slug: string | null
    icon?: string | null
  } | null
}

function trimmed(value: string | null | undefined): string | null {
  const next = value?.trim()
  return next ? next : null
}

export function pickProductCard(product: ProductCardSource): ProductCardData {
  return {
    id: product.id,
    slug: trimmed(product.slug),
    title: product.title,
    excerpt: product.excerpt,
    description: product.description,
    dateCreated: product.date_created,
    imageId: product.image?.id ?? null,
    brand: trimmed(product.brand?.title),
    model: trimmed(product.model?.title),
    categoryTitle: trimmed(product.product_category?.title),
    categorySlug: trimmed(product.product_category?.slug),
    categoryIcon: trimmed(product.product_category?.icon),
  }
}
