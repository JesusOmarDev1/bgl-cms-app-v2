export type QrCodeBlockSize = "small" | "medium" | "big"
export type QrCodeBlockAlignment = "left" | "center" | "right"

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
