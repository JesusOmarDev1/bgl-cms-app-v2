import Link from "next/link"
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
import type { LogosClientsBlock } from "@/types/blocks/content/logos-clients-block"
import type { LogosClientsBlockClientsJunction } from "@/types/collections/junctions/logos-clients-block-clients"

function logosOf(clients: LogosClientsBlock["clients"]) {
  const logos: {
    id: number
    src: string
    name: string
    website: string | null
  }[] = []
  for (const row of expandedJunctions<LogosClientsBlockClientsJunction>(
    clients
  )) {
    if (!isExpanded(row.clients_id)) continue
    if (!isPublishedStatus(row.clients_id.status)) continue
    if (row.clients_id.active === false) continue
    const src = directusFileId(row.clients_id.logo)
    if (!src) continue
    logos.push({
      id: row.id,
      src,
      name: row.clients_id.name,
      website: row.clients_id.website,
    })
  }
  return logos
}

export function LogosClientsClient({ data }: { data: LogosClientsBlock }) {
  const logos = logosOf(data.clients)
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
