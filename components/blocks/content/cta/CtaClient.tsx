import type { CtaBlockQuery } from "@/services/domain/db/queries/blocks/cta-block/cta-block.fields"
import { CtaNormalClient } from "./CtaNormalClient"

export function CtaClient({ data }: { data: CtaBlockQuery }) {
  switch (data.variant) {
    case "normal":
      return <CtaNormalClient data={data} />
    default:
      return null
  }
}
