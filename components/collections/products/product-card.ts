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

function expectProductCard() {
  const card = pickProductCard({
    id: "1",
    slug: "",
    title: "Indicador",
    excerpt: "<p>ok</p>",
    description: null,
    date_created: "2020-01-01T00:00:00.000Z",
    image: { id: "file" },
    brand: { title: "Metrology" },
    model: { title: "A-2" },
    product_category: { title: "Etiquetadoras", slug: "etiquetadoras" },
  })
  if (
    card.slug !== null ||
    card.brand !== "Metrology" ||
    card.model !== "A-2" ||
    card.categoryTitle !== "Etiquetadoras" ||
    card.categorySlug !== "etiquetadoras" ||
    card.imageId !== "file"
  ) {
    throw new Error("product card self-check failed")
  }
}

expectProductCard()
