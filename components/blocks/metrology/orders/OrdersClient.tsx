"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs"
import { DateRangePicker, type DateRangePickerValue } from "@/components/shared/forms/DateRangePicker"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { OrdersQueryResult } from "@/services/domain/db/repositories/collections/order"

const PAGE_SIZE = 20
const MAX_SPECIFIC_DATES = 31
const queryOptions = { history: "replace" as const, shallow: false, scroll: false }
const dateFormat = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "America/Mexico_City",
})

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date)
}

function dateToString(date: Date) {
  return `${date.getFullYear().toString().padStart(4, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
}

function stringToDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null
}

function orderDateValue(
  mode: string | null,
  start: string | null,
  end: string | null,
  days: string[] | null
): DateRangePickerValue | null {
  if (mode === "days" && days?.length) {
    const dates = days.map(stringToDate)
    if (dates.every((date) => date !== null)) {
      return { mode: "days", days: dates }
    }
  }
  if (mode === "range" && start) {
    const startDate = stringToDate(start)
    const endDate = stringToDate(end)
    if (startDate) return { mode: "range", start: startDate, end: endDate }
  }
  return null
}

function statusLabel(status: string, t: ReturnType<typeof useTranslations>) {
  if (status === "draft") return t("status.draft")
  if (status === "paid") return t("status.paid")
  return t("status.cancelled")
}

function displayOrderDate(orders: OrdersQueryResult[number], t: ReturnType<typeof useTranslations>) {
  const client = typeof orders.client === "object" ? orders.client?.name : null
  const technicianRecord = orders.technician_name
  const technician =
    technicianRecord && typeof technicianRecord === "object"
      ? [technicianRecord.first_name, technicianRecord.last_name]
          .filter(Boolean)
          .join(" ")
      : null
  const scales = Array.isArray(orders.scales)
    ? orders.scales.flatMap((entry) => {
        if (typeof entry !== "object" || entry === null || !("scales_id" in entry)) return []
        const scale = typeof entry.scales_id === "object" ? entry.scales_id : null
        return scale ? [[scale.title, scale.serial_number].filter(Boolean).join(" · ")] : []
      })
    : []
  return { client: client || t("missingValue"), technician: technician || t("missingValue"), scales }
}

export function OrdersClient({ orders }: { orders: OrdersQueryResult }) {
  const t = useTranslations("metrology.orders")
  const [dateLimitReached, setDateLimitReached] = useState(false)
  const [query, setQuery] = useQueryStates(
    {
      status: parseAsStringLiteral(["all", "draft", "paid", "cancelled"] as const).withDefault("all"),
      q: parseAsString.withDefault(""),
      dateMode: parseAsStringLiteral(["range", "days"] as const),
      from: parseAsString,
      to: parseAsString,
      days: parseAsArrayOf(parseAsString),
      page: parseAsInteger.withDefault(1),
      view: parseAsStringLiteral(["table", "list"] as const),
    },
    queryOptions
  )
  const dateValue = orderDateValue(query.dateMode, query.from, query.to, query.days)

  const changeDate = (value: DateRangePickerValue | null) => {
    setDateLimitReached(false)
    if (value?.mode === "days" && value.days.length > MAX_SPECIFIC_DATES) {
      setDateLimitReached(true)
      return
    }
    if (value?.mode === "range") {
      void setQuery({
        dateMode: "range",
        from: dateToString(value.start),
        to: value.end ? dateToString(value.end) : null,
        days: null,
        page: 1,
      })
      return
    }
    if (value?.mode === "days") {
      void setQuery({
        dateMode: "days",
        from: null,
        to: null,
        days: value.days.map(dateToString),
        page: 1,
      })
      return
    }
    void setQuery({ dateMode: null, from: null, to: null, days: null, page: 1 })
  }

  const statuses = [
    ["all", t("tabs.all")],
    ["draft", t("tabs.drafts")],
    ["paid", t("tabs.paid")],
    ["cancelled", t("tabs.cancelled")],
  ] as const
  const selectedView = query.view
  const listClass = selectedView === "table" ? "hidden" : selectedView === "list" ? "block" : "block md:hidden"
  const tableClass = selectedView === "list" ? "hidden" : selectedView === "table" ? "block" : "hidden md:block"

  return (
    <section className="flex min-w-0 flex-col gap-6" aria-label={t("title")}>
      <Tabs
        selectedKey={query.status}
        onSelectionChange={(status) => {
          const selectedStatus = statuses.find(([value]) => value === status)?.[0]
          if (selectedStatus) void setQuery({ status: selectedStatus, page: 1 })
        }}
        className="min-w-0 flex flex-col gap-4"
      >
        <TabsList
          aria-label={t("tabs.label")}
          variant="line"
          className="group-data-horizontal/tabs:h-13 w-full min-w-0 justify-start overflow-x-auto overflow-y-hidden border-b border-border"
        >
          {statuses.map(([status, label]) => (
            <TabsTrigger
              key={status}
              id={status}
              className="h-11 shrink-0 flex-none rounded-none px-3"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex flex-col gap-4">
          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(16rem,auto)] md:items-end lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)_auto]">
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            {t("search.label")}
            <Input
              aria-label={t("search.label")}
              maxLength={100}
              onChange={(event) => void setQuery({ q: event.target.value, page: 1 })}
              placeholder={t("search.placeholder")}
              type="search"
              value={query.q}
            />
          </label>
          <div className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span>{t("date.label")}</span>
            <DateRangePicker
              aria-label={t("date.label")}
              locale="es-MX"
              onValueChange={changeDate}
              placeholder={t("date.placeholder")}
              value={dateValue}
            />
            {dateLimitReached ? <p role="alert" className="text-destructive">{t("date.limit")}</p> : null}
          </div>
          <div className="flex h-11 w-fit gap-1 rounded-lg border border-border p-0.5" role="group" aria-label={t("view.label")}>
            <TooltipTrigger>
              <Button
                type="button"
                variant={selectedView === "table" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-md"
                aria-label={t("view.table")}
                aria-pressed={selectedView === "table"}
                onPress={() => void setQuery({ view: "table" })}
              >
                <MaterialIcon name="table_rows" className={selectedView === "table" ? "text-foreground" : "text-muted-foreground"} />
              </Button>
              <Tooltip>{t("view.table")}</Tooltip>
            </TooltipTrigger>
            <TooltipTrigger>
              <Button
                type="button"
                variant={selectedView === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-md"
                aria-label={t("view.list")}
                aria-pressed={selectedView === "list"}
                onPress={() => void setQuery({ view: "list" })}
              >
                <MaterialIcon name="view_list" className={selectedView === "list" ? "text-foreground" : "text-muted-foreground"} />
              </Button>
              <Tooltip>{t("view.list")}</Tooltip>
            </TooltipTrigger>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {t("results", { count: orders.length })}
          </p>
        </div>
      </div>

      <TabsContent
        id={query.status}
        className="mt-2 min-w-0 flex-1 text-inherit outline-none"
      >
      {orders.length === 0 ? (
        <Empty className="border border-border bg-card/30">
          <EmptyHeader>
            <EmptyTitle>{query.q || dateValue || query.status !== "all" || query.page > 1 ? t("empty.filteredTitle") : t("empty.title")}</EmptyTitle>
            <EmptyDescription>{query.q || dateValue || query.status !== "all" || query.page > 1 ? t("empty.filteredDescription") : t("empty.description")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className={`${tableClass} min-w-0 overflow-x-auto rounded-xl border border-border bg-card/30`}>
            <Table aria-label={t("table.label")} className="min-w-[52rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("fields.folio")}</TableHead>
                  <TableHead>{t("fields.date")}</TableHead>
                  <TableHead>{t("fields.client")}</TableHead>
                  <TableHead>{t("fields.scales")}</TableHead>
                  <TableHead>{t("fields.technician")}</TableHead>
                  <TableHead>{t("fields.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const values = displayOrderDate(order, t)
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="max-w-48 whitespace-normal break-all font-medium tabular-nums">{order.folio || t("missingValue")}</TableCell>
                      <TableCell className="tabular-nums">{formatDate(order.date_created)}</TableCell>
                      <TableCell className="whitespace-normal">{values.client}</TableCell>
                      <TableCell className="max-w-64 whitespace-normal">{values.scales.length ? values.scales.join(", ") : t("missingValue")}</TableCell>
                      <TableCell className="whitespace-normal">{values.technician}</TableCell>
                      <TableCell><Badge variant="outline">{statusLabel(order.status, t)}</Badge></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <ItemGroup className={`${listClass} gap-3`} aria-label={t("list.label")}>
            {orders.map((order) => {
              const values = displayOrderDate(order, t)
              return (
                <Item key={order.id} variant="outline" className="items-start">
                  <ItemContent className="min-w-0 gap-3">
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                      <ItemTitle className="max-w-full break-all tabular-nums">{order.folio || t("missingValue")}</ItemTitle>
                      <Badge variant="outline">{statusLabel(order.status, t)}</Badge>
                    </div>
                    <ItemDescription>{t("fields.date")}: {formatDate(order.date_created)}</ItemDescription>
                    <ItemDescription>{t("fields.client")}: {values.client}</ItemDescription>
                    <ItemDescription>{t("fields.scales")}: {values.scales.length ? values.scales.join(", ") : t("missingValue")}</ItemDescription>
                    <ItemDescription>{t("fields.technician")}: {values.technician}</ItemDescription>
                  </ItemContent>
                </Item>
              )
            })}
          </ItemGroup>
          <Pagination aria-label={t("pagination.label")}>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  isDisabled={query.page <= 1}
                  onClick={(event) => {
                    event.preventDefault()
                    if (query.page > 1) void setQuery({ page: query.page - 1 })
                  }}
                  text={t("pagination.previous")}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-3 text-sm tabular-nums" aria-current="page">{t("pagination.page", { page: query.page })}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  isDisabled={orders.length < PAGE_SIZE}
                  onClick={(event) => {
                    event.preventDefault()
                    if (orders.length === PAGE_SIZE) void setQuery({ page: query.page + 1 })
                  }}
                  text={t("pagination.next")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
      {orders.length === 0 && query.page > 1 ? (
        <Pagination aria-label={t("pagination.label")}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  void setQuery({ page: query.page - 1 })
                }}
                text={t("pagination.previous")}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 text-sm tabular-nums" aria-current="page">{t("pagination.page", { page: query.page })}</span>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
      </TabsContent>
      </Tabs>
    </section>
  )
}
