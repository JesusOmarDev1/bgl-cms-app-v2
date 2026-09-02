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
import { loadDebugCollectionCount } from "@/services/domain/db/debug/load-debug-resource"

export const instant = false

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type DebugPageProps = {
  searchParams: Promise<SearchParams>
}

async function DebugToolbarSlot({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { kind, resource } = await loadDebugSearchParams(searchParams)
  const total = await loadDebugCollectionCount(kind, resource)
  return <DebugToolbar total={total} />
}

async function DebugPagePayload({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { kind, resource, page, limit } =
    await loadDebugSearchParams(searchParams)
  return (
    <DebugPayload kind={kind} resource={resource} page={page} limit={limit} />
  )
}

export default function DebugPage({ searchParams }: DebugPageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }

  return (
    <Box
      className="mx-auto min-h-dvh w-full max-w-7xl"
      display="flex"
      orientation="vertical"
      padding={3}
      gap={1.5}
    >
      <Suspense fallback={<DebugToolbarSkeleton />}>
        <DebugToolbarSlot searchParams={searchParams} />
      </Suspense>
      <Suspense defer name="debug-payload" fallback={<DebugPayloadSkeleton />}>
        <DebugPagePayload searchParams={searchParams} />
      </Suspense>
    </Box>
  )
}
