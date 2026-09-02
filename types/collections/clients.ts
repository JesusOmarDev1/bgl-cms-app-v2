import type { ClientBranch } from "@/types/enums/client-branch"
import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface ClientsTypes {
  // General
  id: string
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
