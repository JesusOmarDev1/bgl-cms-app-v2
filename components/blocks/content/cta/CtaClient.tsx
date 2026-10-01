import { CtaBlock } from "@/types/blocks/content/cta-block"
import { CtaNormalClient } from "./CtaNormalClient"

export function CtaClient({ data }: { data: CtaBlock }) {
  switch (data.variant) {
    case "normal":
      return <CtaNormalClient data={data} />
    default:
      return null
  }
}
