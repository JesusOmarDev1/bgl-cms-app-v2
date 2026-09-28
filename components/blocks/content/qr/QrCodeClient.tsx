"use client"
import { useMemo } from "react"
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
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"

export default function QrCodeClient({ data }: { data: QrCodeBlock }) {
  const size = useMemo(() => {
    switch (data.size) {
      case "small":
        return 100
      case "medium":
        return 200
      case "big":
        return 300
    }
  }, [data.size])

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
  return <QRCode data={data.url} size={size} />
}
