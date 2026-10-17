import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import type { FeaturedServicesBlockQuery } from "@/services/domain/db/queries/blocks/featured-services-block/featured-services-block.fields"

export function FeaturedServicesClient({
  data,
}: {
  data: FeaturedServicesBlockQuery
}) {
  const services: {
    id: number
    title: string
    excerpt: string | null
    src: string | null
  }[] = []
  for (const row of data.services ?? []) {
    const service = row.services_id
    if (!service || service.status !== "published") continue
    const src = service.image?.id || null
    if (!src && !service.title && !service.excerpt) continue
    services.push({
      id: row.id,
      title: service.title,
      excerpt: service.excerpt,
      src,
    })
  }
  if (!data.title && !data.excerpt && services.length === 0) return null

  return (
    <BoxContainer>
      <Box
        data-directus={setAttr({
          collection: "featured_services_block",
          item: data.id,
          fields: "title,excerpt,services",
          mode: "popover",
        })}
        display="flex"
        gap={3}
        orientation="vertical"
        paddingBottom={3}
        paddingTop={3}
        render={(props) => <section {...props} />}
      >
        <BlockHeading excerpt={data.excerpt} title={data.title} />
        {services.map((service) => (
          <Box
            key={service.id}
            align="center"
            cols={{ base: 1, md: 2 }}
            display="grid"
            gap={2}
            render={(props) => <article {...props} />}
          >
            {service.src ? (
              <DirectusImage
                alt={service.title}
                className="w-full rounded-xl"
                sizing="contained"
                src={service.src}
                variant="detail"
              />
            ) : null}
            <div>
              {service.title ? <h3>{service.title}</h3> : null}
              {service.excerpt ? (
                <SafeHtml content={service.excerpt} preset="compact" />
              ) : null}
            </div>
          </Box>
        ))}
      </Box>
    </BoxContainer>
  )
}
