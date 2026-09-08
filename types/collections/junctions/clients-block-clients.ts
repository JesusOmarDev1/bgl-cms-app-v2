import type { ClientsBlock } from "@/types/blocks/content/clients-block"
import type { ClientsTypes } from "@/types/collections/clients"

export interface ClientsBlockClientsJunction {
  id: number
  clients_block_id: string | ClientsBlock
  item: string | ClientsTypes
  collection: "clients"
}
