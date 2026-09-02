import type { LogosClientsBlock } from "@/types/blocks/content/logos-clients-block"
import type { ClientsTypes } from "@/types/collections/clients"

export interface LogosClientsBlockClientsJunction {
  id: number
  logos_clients_block_id: string | LogosClientsBlock
  clients_id: string | ClientsTypes
}
