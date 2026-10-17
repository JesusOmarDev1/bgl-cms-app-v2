import Link from "next/link"
import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import type { LogosClientsBlockQuery } from "@/services/domain/db/queries/blocks/logos-clients-block/logos-clients-block.fields"

export function LogosClientsClient({ data }: { data: LogosClientsBlockQuery }) {
  const logos: {
    id: number
    src: string
    name: string
    website: string | null
  }[] = []
  for (const row of data.clients ?? []) {
    const client = row.clients_id
    if (!client || client.status !== "published") continue
    if (client.active === false) continue
    const src = client.logo?.id
    if (!src) continue
    logos.push({
      id: row.id,
      src,
      name: client.name,
      website: client.website,
    })
  }
  if (!data.title && !data.excerpt && logos.length === 0) return null

  return (
    <BoxContainer>
      <Box
        data-directus={setAttr({
          collection: "logos_clients_block",
          item: data.id,
          fields: "title,excerpt,clients",
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
        {logos.length > 0 ? (
          <ul className="grid w-full min-w-0 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {logos.map((logo) => {
              const image = (
                <DirectusImage
                  alt={logo.name}
                  src={logo.src}
                  title={logo.name}
                  variant="logo"
                />
              )
              return (
                <li
                  key={logo.id}
                  className="flex min-w-0 items-center justify-center"
                >
                  {logo.website ? (
                    <Link href={logo.website} aria-label={logo.name}>
                      {image}
                    </Link>
                  ) : (
                    image
                  )}
                </li>
              )
            })}
          </ul>
        ) : null}
      </Box>
    </BoxContainer>
  )
}
