import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export type ClientBranch =
  | "steel"
  | "construction"
  | "laboratory"
  | "agricultural"
  | "livestock"
  | "fishing"
  | "automotive"
  | "electronics"
  | "plastics"

export interface ClientsTypes {
  // General
  id: string
  sort: number | null
  status: StatusType
  name: string
  website: string | null
  active: boolean
  slug: string | null
  logo: string | DirectusFileTypes | null
  branch: ClientBranch | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
