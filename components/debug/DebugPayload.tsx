import { DebugEmpty } from "@/components/debug/DebugEmpty"
import { DebugJsonViewer } from "@/components/debug/DebugJsonViewer"
import { loadDebugResource } from "@/services/domain/db/debug/load-debug-resource"
import type {
  DebugKind,
  DebugResourceKey,
} from "@/services/domain/db/debug/catalog"

type DebugPayloadProps = {
  kind: DebugKind | null
  resource: DebugResourceKey | null
  page: number
  limit: number
}

export async function DebugPayload({
  kind,
  resource,
  page,
  limit,
}: DebugPayloadProps) {
  const data = await loadDebugResource(kind, resource, { page, limit })

  if (data === null || resource === null) {
    return <DebugEmpty />
  }

  return (
    <DebugJsonViewer
      key={`${resource}:${page}:${limit}`}
      data={data}
      title={resource}
      rootName={resource}
      defaultExpanded={1}
    />
  )
}
