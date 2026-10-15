import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import {
  directusFileId,
  expandedJunctions,
  isExpanded,
  isPublishedStatus,
} from "@/components/blocks/directus-relation"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { FeaturedProductsBlock } from "@/types/blocks/content/featured-products-block"
import type { FeaturedProductsBlockProductsJunction } from "@/types/collections/junctions/featured-products-block-products"

function productsOf(products: FeaturedProductsBlock["products"]) {
  const items: {
    id: number
    title: string
    excerpt: string | null
    src: string | null
  }[] = []
  for (const row of expandedJunctions<FeaturedProductsBlockProductsJunction>(
    products
  )) {
    if (!isExpanded(row.products_id)) continue
    if (!isPublishedStatus(row.products_id.status)) continue
    const src = directusFileId(row.products_id.image)
    if (!src && !row.products_id.title && !row.products_id.excerpt) continue
    items.push({
      id: row.id,
      title: row.products_id.title,
      excerpt: row.products_id.excerpt,
      src,
    })
  }
  return items
}

export function FeaturedProductsClient({
  data,
}: {
  data: FeaturedProductsBlock
}) {
  const products = productsOf(data.products)
  if (!data.title && !data.excerpt && products.length === 0) return null

  return (
    <BoxContainer>
      <Box
        data-directus={setAttr({
          collection: "featured_products_block",
          item: data.id,
          fields: "title,excerpt,products",
          mode: "popover",
        })}
        display="flex"
        gap={2}
        orientation="vertical"
        paddingBottom={3}
        paddingTop={3}
        render={(props) => <section {...props} />}
      >
        <BlockHeading excerpt={data.excerpt} title={data.title} />
        {products.length > 0 ? (
          <Box
            className="list-none"
            cols={{ base: 1, sm: 2, lg: 3 }}
            display="grid"
            gap={2}
            render={(props) => <ul {...props} />}
          >
            {products.map((product) => (
              <li key={product.id} className="min-w-0">
                <Card className="h-full">
                  {product.src ? (
                    <DirectusImage
                      alt={product.title}
                      className="w-full"
                      sizing="contained"
                      src={product.src}
                      variant="card"
                    />
                  ) : null}
                  <CardHeader>
                    {product.title ? (
                      <CardTitle>{product.title}</CardTitle>
                    ) : null}
                    {product.excerpt ? (
                      <CardDescription>
                        <SafeHtml content={product.excerpt} preset="compact" />
                      </CardDescription>
                    ) : null}
                  </CardHeader>
                </Card>
              </li>
            ))}
          </Box>
        ) : null}
      </Box>
    </BoxContainer>
  )
}
