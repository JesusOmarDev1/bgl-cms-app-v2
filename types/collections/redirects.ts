import type { HttpRedirectType } from "@/types/enums/http-redirect"

export interface RedirectsTypes {
  // General
  id: string
  title: string
  origin: string
  destiny: string
  http_code: HttpRedirectType
  note: string | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
