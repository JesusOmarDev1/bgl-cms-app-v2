import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { SearchParams } from "nuqs/server"

import { Box } from "@/components/shared/content/Box"
import { DebugPayload } from "@/components/debug/DebugPayload"
import { DebugPayloadSkeleton } from "@/components/debug/DebugPayloadSkeleton"
import { DebugToolbar } from "@/components/debug/DebugToolbar"
import { DebugToolbarSkeleton } from "@/components/debug/DebugToolbarSkeleton"
import { loadDebugSearchParams } from "@/app/debug/search-params"

export const instant = false

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type DebugPageProps = {
  searchParams: Promise<SearchParams>
}

async function DebugPagePayload({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { kind, resource } = await loadDebugSearchParams(searchParams)
  return <DebugPayload kind={kind} resource={resource} />
}

export default function DebugPage({ searchParams }: DebugPageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }

  return (
    <Box
      className="min-h-dvh"
      display="flex"
      orientation="vertical"
      padding={4}
      gap={4}
    >
      <Suspense fallback={<DebugToolbarSkeleton />}>
        <DebugToolbar />
      </Suspense>
      <Suspense
        defer
        name="debug-payload"
        fallback={<DebugPayloadSkeleton />}
      >
        <DebugPagePayload searchParams={searchParams} />
      </Suspense>
    </Box>
  )
}
