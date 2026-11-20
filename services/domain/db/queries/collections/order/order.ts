import "server-only"

import { readItem, readItems, type Query } from "@directus/sdk"
import { createPrivateDirectus } from "@/config/directus-private"
import {
  ORDER_DETAIL_FIELDS,
  ORDER_LIST_FIELDS,
} from "@/services/domain/db/queries/collections/order/order.fields"
import type { OrderTypes, OrderStatus } from "@/types/collections/order"
import type { Schema } from "@/types/schema"
import {
  buildOrderDateFilter,
  type OrderDateFilterInput,
} from "@/services/domain/db/queries/collections/order/order-date-filter"

const ORDER_STATUSES = ["draft", "paid", "cancelled"] as const

function isOrderStatus(status: unknown): status is OrderStatus {
  return ORDER_STATUSES.some((validStatus) => validStatus === status)
}

export type OrderStatusFilter = "all" | OrderStatus
export type OrderSortField = "date_created" | "folio"
export type OrderSortDirection = "asc" | "desc"

export interface OrdersQuery {
  limit?: number
  page?: number
  status?: OrderStatusFilter
  search?: string
  dateFilter?: OrderDateFilterInput
  sortBy?: OrderSortField
  sortDirection?: OrderSortDirection
}

const DEFAULT_ORDER_LIMIT = 10
const MAX_ORDER_LIMIT = 100
const MAX_ORDER_SEARCH_LENGTH = 100
const MAX_ORDER_SPECIFIC_DATES = 31

export async function getOrdersQuery(
  accessToken: string,
  {
    limit = DEFAULT_ORDER_LIMIT,
    page = 1,
    status = "all",
    search,
    dateFilter,
    sortBy = "date_created",
    sortDirection = "desc",
  }: OrdersQuery = {}
) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_ORDER_LIMIT) {
    throw new RangeError(
      `limit must be an integer between 1 and ${MAX_ORDER_LIMIT}`
    )
  }
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > Math.floor(Number.MAX_SAFE_INTEGER / limit)
  ) {
    throw new RangeError(
      "page must be a positive safe integer within the result bound"
    )
  }

  if (!ORDER_STATUSES.includes(status as OrderStatus) && status !== "all") {
    throw new RangeError("status must be all, draft, paid, or cancelled")
  }
  if (sortBy !== "date_created" && sortBy !== "folio") {
    throw new RangeError("sortBy must be date_created or folio")
  }
  if (sortDirection !== "asc" && sortDirection !== "desc") {
    throw new RangeError("sortDirection must be asc or desc")
  }
  if (search !== undefined && typeof search !== "string") {
    throw new RangeError("search must be a string")
  }
  if (search && search.length > MAX_ORDER_SEARCH_LENGTH) {
    throw new RangeError(
      `search must not exceed ${MAX_ORDER_SEARCH_LENGTH} characters`
    )
  }
  if (
    dateFilter?.mode === "specific" &&
    (!Array.isArray(dateFilter.dates) ||
      dateFilter.dates.length > MAX_ORDER_SPECIFIC_DATES)
  ) {
    throw new RangeError(
      `specific dates must contain at most ${MAX_ORDER_SPECIFIC_DATES} dates`
    )
  }

  const filters: Record<string, unknown>[] = []
  if (status !== "all") filters.push({ status: { _eq: status } })
  const normalizedSearch = search?.trim()
  if (normalizedSearch) {
    filters.push({
      _or: [
        { folio: { _icontains: normalizedSearch } },
        { client: { name: { _icontains: normalizedSearch } } },
      ],
    })
  }
  if (dateFilter) filters.push(buildOrderDateFilter(dateFilter))

  const filter =
    filters.length === 0
      ? undefined
      : filters.length === 1
        ? filters[0]
        : { _and: filters }

  const directus = await createPrivateDirectus(accessToken)
  const sortField = (
    {
      date_created: { asc: "date_created", desc: "-date_created" },
      folio: { asc: "folio", desc: "-folio" },
    } as const
  )[sortBy][sortDirection]
  return directus.request(
    readItems("order", {
      // directus_users stays out of Schema; the technician relation is locally verified but not SDK-typed.
      fields: ORDER_LIST_FIELDS as unknown as Query<
        Schema,
        OrderTypes
      >["fields"],
      deep: { scales: { _sort: ["sort"] } },
      ...(filter ? { filter } : {}),
      limit,
      page,
      sort: [sortField, "id"],
    } satisfies Query<Schema, OrderTypes>)
  )
}

export async function getOrderQuery(accessToken: string, id: string) {
  const directus = await createPrivateDirectus(accessToken)
  const order = await directus.request(
    readItem("order", id, {
      // Keep the user relation expansion narrow without adding directus_users to Schema.
      fields: ORDER_DETAIL_FIELDS as unknown as Query<
        Schema,
        OrderTypes
      >["fields"],
      deep: { scales: { _sort: ["sort"] } },
    } satisfies Query<Schema, OrderTypes>)
  )

  return order && isOrderStatus(order.status) ? order : null
}

export type OrdersQueryResult = Awaited<ReturnType<typeof getOrdersQuery>>
export type OrderQueryResult = Awaited<ReturnType<typeof getOrderQuery>>
