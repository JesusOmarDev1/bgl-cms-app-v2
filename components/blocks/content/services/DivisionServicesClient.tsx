import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import type { DivisionServicesBlockQuery } from "@/services/domain/db/queries/blocks/division-services-block/division-services-block.fields"

export function DivisionServicesClient({
  data,
}: {
  data: DivisionServicesBlockQuery
}) {
  const divisions: { id: number; title: string; src: string | null }[] = []
  for (const row of data.division_services ?? []) {
    const division = row.division_services_id
    if (!division) continue
    const src = division.image?.id || null
    if (!src && !division.title) continue
    divisions.push({
      id: row.id,
      title: division.title,
      src,
    })
  }
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
                  <DirectusImage
                    alt={division.title}
                    className="w-full rounded-2xl transition-all duration-300 ease-in-out hover:cursor-pointer hover:mask-b-from-60%"
                    sizing="contained"
                    src={division.src}
                    variant="card"
                  />
                </li>
              ) : null
            )}
          </Box>
        ) : null}
      </Box>
    </BoxContainer>
  )
}
