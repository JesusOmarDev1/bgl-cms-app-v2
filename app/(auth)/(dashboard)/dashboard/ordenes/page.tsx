import type { Metadata } from "next"
import { connection } from "next/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { OrdersClient } from "@/components/blocks/metrology/orders/OrdersClient"
import { getDirectusCode } from "@/lib/directus/directus-error"
import { getOrdersRepository } from "@/services/domain/db/repositories/collections/order"
import { readAuthSession } from "@/services/domain/server/auth/token"
import type { OrderDateFilterInput } from "@/services/domain/db/queries/collections/order/order-date-filter"
import type {
  OrderSortDirection,
  OrderSortField,
} from "@/services/domain/db/queries/collections/order/order"

export const metadata: Metadata = {
  title: "Órdenes de servicio",
  robots: { index: false, follow: false },
}

type SearchParams = Record<string, string | string[] | undefined>

function getString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined
}

export function readOrderSort(params: SearchParams): {
  sortBy: OrderSortField
  sortDirection: OrderSortDirection
} {
  const sortBy = getString(params.sortBy)
  const sortDirection = getString(params.sortDirection)
  return {
    sortBy:
      sortBy === "date_created" || sortBy === "folio"
        ? sortBy
        : "date_created",
    sortDirection:
      sortDirection === "asc" || sortDirection === "desc"
        ? sortDirection
        : "desc",
  }
}

function readDateFilter(
  params: SearchParams
): OrderDateFilterInput | undefined {
  const mode = getString(params.dateMode)
  if (!mode) return undefined
  if (mode === "range") {
    const startDate = getString(params.from)
    const endDate = getString(params.to)
    if (!startDate) return undefined
    return { mode: "period", startDate, ...(endDate ? { endDate } : {}) }
  }
  if (mode === "days") {
    const rawDates = getString(params.days)
    if (!rawDates || rawDates.length > 340) {
      throw new RangeError("specific dates exceed the supported URL size")
    }
    const dates = rawDates.split(",")
    if (dates.length > 31) {
      throw new RangeError("specific dates exceed the supported count")
    }
    return { mode: "specific", dates }
  }
  return undefined
}

function queryErrorKind(error: unknown): "denied" | "error" | "invalid" {
  if (error instanceof RangeError) return "invalid"
  if (getDirectusCode(error) === "FORBIDDEN") return "denied"
  return "error"
}

async function OrdersPageContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await connection()
  const session = await readAuthSession()
  if (!session?.accessToken) redirect("/login")

  const params = await searchParams
  const rawPage = getString(params.page)
  const page = rawPage && /^\d+$/.test(rawPage) ? Number(rawPage) : 1
  const rawStatus = getString(params.status)
  const status =
    rawStatus === "draft" || rawStatus === "paid" || rawStatus === "cancelled"
      ? rawStatus
      : "all"
  const search = getString(params.q) ?? ""
  const orderSort = readOrderSort(params)
  const t = await getTranslations("metrology.orders")

  let orders: Awaited<ReturnType<typeof getOrdersRepository>> | null = null
  let errorKind: "denied" | "error" | "invalid" | null = null
  try {
    orders = await getOrdersRepository({
      accessToken: session.accessToken,
      limit: 20,
      page,
      status,
      search,
      dateFilter: readDateFilter(params),
      ...orderSort,
    })
  } catch (error) {
    errorKind = queryErrorKind(error)
  }

  if (errorKind) {
    return (
      <section
        className="rounded-xl border border-border bg-card/30 p-6"
        role="alert"
      >
        <h2 className="text-lg font-medium">{t(`state.${errorKind}.title`)}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(`state.${errorKind}.description`)}
        </p>
      </section>
    )
  }
  return <OrdersClient orders={orders ?? []} />
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const t = await getTranslations("metrology.orders")
  return (
    <main className="min-h-[calc(100svh-3rem)] flex-1 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <OrdersPageContent searchParams={searchParams} />
      </div>
    </main>
  )
}
