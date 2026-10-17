import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
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
import type { FeaturedProductsBlockQuery } from "@/services/domain/db/queries/blocks/featured-products-block/featured-products-block.fields"

export function FeaturedProductsClient({
  data,
}: {
  data: FeaturedProductsBlockQuery
}) {
  const products: {
    id: number
    title: string
    excerpt: string | null
    src: string | null
  }[] = []
  for (const row of data.products ?? []) {
    const product = row.products_id
    if (!product || product.status !== "published") continue
    const src = product.image?.id || null
    if (!src && !product.title && !product.excerpt) continue
    products.push({
      id: row.id,
      title: product.title,
      excerpt: product.excerpt,
      src,
    })
  }
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
