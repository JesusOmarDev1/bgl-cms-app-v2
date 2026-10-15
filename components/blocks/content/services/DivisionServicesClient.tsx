import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import {
  directusFileId,
  expandedJunctions,
  isExpanded,
} from "@/components/blocks/directus-relation"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { Card } from "@/components/ui/card"
import type { DivisionServicesBlock } from "@/types/blocks/content/services/division-services-block"
import type { DivisionServicesBlockDivisionServicesJunction } from "@/types/collections/junctions/division-services-block-division-services"

function divisionsOf(rows: DivisionServicesBlock["division_services"]) {
  const items: { id: number; title: string; src: string | null }[] = []
  for (const row of expandedJunctions<DivisionServicesBlockDivisionServicesJunction>(
    rows
  )) {
    if (!isExpanded(row.division_services_id)) continue
    const src = directusFileId(row.division_services_id.image)
    if (!src && !row.division_services_id.title) continue
    items.push({
      id: row.id,
      title: row.division_services_id.title,
      src,
    })
  }
  return items
}

export function DivisionServicesClient({
  data,
}: {
  data: DivisionServicesBlock
}) {
  const divisions = divisionsOf(data.division_services)
  if (!data.title && !data.excerpt && divisions.length === 0) return null

  return (
    <BoxContainer>
      <Box
        data-directus={setAttr({
          collection: "division_services_block",
          item: data.id,
          fields: "title,excerpt,division_services",
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
        {divisions.length > 0 ? (
          <Box
            className="list-none"
            cols={{ base: 1, sm: 2, lg: 3 }}
            display="grid"
            gap={2}
            render={(props) => <ul {...props} />}
          >
            {divisions.map((division) =>
              division.src ? (
                <li key={division.id} className="min-w-0">
                  <Card className="h-full">
                    <DirectusImage
                      alt={division.title}
                      className="w-full"
                      sizing="contained"
                      src={division.src}
                      variant="card"
                    />
                  </Card>
                </li>
              ) : null
            )}
          </Box>
        ) : null}
      </Box>
    </BoxContainer>
  )
}
