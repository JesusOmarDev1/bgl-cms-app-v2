import "server-only"

import {
  pickProductCard,
  type ProductCardData,
  type ProductCardSource,
} from "@/components/collections/products/product-card"
import { sanitizeHtml } from "@/lib/formatting/sanitize"

function clean(value: string | null): string | null {
  if (!value) return null
  const sanitized = sanitizeHtml(value)
  return sanitized.trim().length > 0 ? sanitized : null
}

export function toProductCard(product: ProductCardSource): ProductCardData {
  const card = pickProductCard(product)
  return {
    ...card,
    excerpt: clean(card.excerpt),
    description: clean(card.description),
  }
}
