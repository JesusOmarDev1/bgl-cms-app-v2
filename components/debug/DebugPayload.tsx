import { JsonViewer } from "@/components/shared/debug/JsonViewer"
import { DebugEmpty } from "@/components/debug/DebugEmpty"
import { loadDebugResource } from "@/services/domain/db/debug/load-debug-resource"
import type { DebugKind } from "@/services/domain/db/debug/catalog"

type DebugPayloadProps = {
  kind: DebugKind | null
  resource: string | null
}

export async function DebugPayload({ kind, resource }: DebugPayloadProps) {
  const data = await loadDebugResource(kind, resource)

  if (data === null || resource === null) {
    return <DebugEmpty />
  }

  return (
    <JsonViewer
      key={resource}
      data={data}
      title={resource}
      rootName={resource}
      defaultExpanded={1}
    />
  )
}
