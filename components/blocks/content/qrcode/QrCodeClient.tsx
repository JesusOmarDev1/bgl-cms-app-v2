"use client"
import { useMemo } from "react"
import { QRCode } from "@/components/shared/utility/QrCode"
import { QrCodeBlock } from "@/types/blocks/content/qr-code-block"

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

  return <QRCode data={data.url} size={size} />
}
