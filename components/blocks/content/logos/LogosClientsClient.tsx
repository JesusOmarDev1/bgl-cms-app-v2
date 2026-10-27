import Link from "next/link"
import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import type { LogosClientsBlockQuery } from "@/services/domain/db/queries/blocks/logos-clients-block/logos-clients-block.fields"

export function LogosClientsClient({ data }: { data: LogosClientsBlockQuery }) {
  const hasLogo = data.clients?.some((row) => row.clients_id.logo?.id)
  if (!data.title && !data.excerpt && !hasLogo) return null

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
        {hasLogo ? (
          <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {data.clients?.map((row) => {
              const src = row.clients_id.logo?.id
              if (!src) return null
              const image = (
                <DirectusImage
                  alt={row.clients_id.name}
                  src={src}
                  title={row.clients_id.name}
                  variant="logo-lg"
                />
              )
              return (
                <li
                  key={row.id}
                  className="flex min-w-0 items-center justify-center"
                >
                  {row.clients_id.website ? (
                    <Link
                      href={row.clients_id.website}
                      aria-label={row.clients_id.name}
                    >
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
