import type { QrCodeBlockAlignment } from "@/types/enums/qr-code-block-alignment"
import type { QrCodeBlockSize } from "@/types/enums/qr-code-block-size"

export interface QrCodeBlock {
  // General
  id: string
  sort: number | null
  title: string
  size: QrCodeBlockSize
  alignment: QrCodeBlockAlignment
  url: string
  excerpt: string | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
