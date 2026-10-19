import { ContentSkeleton } from "@/components/blocks/content/html/ContentSkeleton"
import { CtaSkeleton } from "@/components/blocks/content/cta/CtaSkeleton"
import { HeroSkeleton } from "@/components/blocks/content/hero/HeroSkeleton"
import { Box } from "@/components/shared/content/Box"

export function BlockPageSkeleton() {
  return (
    <Box
      aria-hidden="true"
      className="w-full min-w-0"
      display="flex"
      gap={4}
      orientation="vertical"
    >
      <HeroSkeleton />
      <ContentSkeleton />
      <CtaSkeleton />
    </Box>
  )
}
