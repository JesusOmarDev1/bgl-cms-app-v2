import {
  getOrderQuery,
  getOrdersQuery,
  type OrdersQuery,
  type OrdersQueryResult,
  type OrderQueryResult,
} from "@/services/domain/db/queries/collections/order/order"

export type { OrdersQuery }
export type { OrdersQueryResult, OrderQueryResult }

export async function getOrdersRepository({
  accessToken,
  ...query
}: OrdersQuery & { accessToken: string }): Promise<OrdersQueryResult> {
  return getOrdersQuery(accessToken, query)
}

export async function getOrderRepository({
  accessToken,
  id,
}: {
  accessToken: string
  id: string
}): Promise<OrderQueryResult> {
  return getOrderQuery(accessToken, id)
}
