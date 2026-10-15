import { ContentSkeleton } from "@/components/blocks/content/html/ContentSkeleton"
import { CtaSkeleton } from "@/components/blocks/content/cta/CtaSkeleton"
import { HeroSkeleton } from "@/components/blocks/content/hero/HeroSkeleton"

export function BlockPageSkeleton() {
  return (
    <div aria-hidden="true">
      <HeroSkeleton />
      <ContentSkeleton />
      <CtaSkeleton />
    </div>
  )
}
