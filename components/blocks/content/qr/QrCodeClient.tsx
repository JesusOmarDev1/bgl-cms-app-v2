"use client"
import { QRCode } from "@/components/shared/utility/QrCode"
import { QrCodeBlock } from "@/types/blocks/content/qr-code-block"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import type { QrCodeBlockAlignment } from "@/types/enums/qr-code-block-alignment"
import type { QrCodeBlockSize } from "@/types/enums/qr-code-block-size"

function qrSize(size: QrCodeBlockSize): number {
  switch (size) {
    case "small":
      return 100
    case "medium":
      return 200
    case "big":
      return 300
    default:
      return 200
  }
}

function qrAlign(alignment: QrCodeBlockAlignment) {
  switch (alignment) {
    case "left":
      return "start" as const
    case "right":
      return "end" as const
    case "center":
      return "center" as const
    default:
      return "center" as const
  }
}

export default function QrCodeClient({ data }: { data: QrCodeBlock }) {
  if (!data.url || !data.title) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MaterialIcon name="qr_code" size={24} />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>No se puede generar el codigo QR</EmptyTitle>
          <EmptyDescription>
            Revisa tu conexión a internet y vuelve a intentarlo.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Box
      align={qrAlign(data.alignment)}
      display="flex"
      gap={2}
      orientation="vertical"
    >
      <h2>{data.title}</h2>
      {data.excerpt ? (
        <SafeHtml content={data.excerpt} preset="compact" />
      ) : null}
      <QRCode data={data.url} size={qrSize(data.size)} />
    </Box>
  )
}
