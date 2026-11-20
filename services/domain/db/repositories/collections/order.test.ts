import { beforeEach, describe, expect, it, vi } from "vitest"

const { request, createPrivateDirectus } = vi.hoisted(() => ({
  request: vi.fn(),
  createPrivateDirectus: vi.fn(async (_accessToken: string) => ({ request })),
}))
vi.mock("server-only", () => ({}))
vi.mock("@directus/sdk", () => ({
  readItem: vi.fn((collection: string, id: string, query: object) => ({
    collection,
    id,
    ...query,
  })),
  readItems: vi.fn((collection: string, query: object) => ({
    collection,
    ...query,
  })),
}))
vi.mock("@/config/directus-private", () => ({ createPrivateDirectus }))

import {
  getOrderRepository,
  getOrdersRepository,
} from "@/services/domain/db/repositories/collections/order"
import { readOrderSort } from "@/app/(auth)/(dashboard)/dashboard/ordenes/page"

const listOrder = {
  id: "order-1",
  folio: "folio-1",
  date_created: "2026-01-02T00:00:00.000Z",
  status: "draft",
  client: { id: "client-1", name: "Cliente" },
  scales: [
    {
      scales_id: {
        id: "scale-1",
        title: "Báscula",
        serial_number: "SERIAL-1",
      },
    },
  ],
  technician_name: {
    id: "employee-1",
    first_name: "Ana",
    last_name: "Técnica",
  },
}

const order = {
  ...listOrder,
  client_name: "Receptor",
  client_department: "Mantenimiento",
  description: "Servicio",
}

describe("private order repositories", () => {
  it("parses only supported sort URL values and leaves filters outside this parser", () => {
    expect(
      readOrderSort({
        sortBy: "folio",
        sortDirection: "asc",
        page: "4",
        status: "paid",
        q: "báscula",
      })
    ).toEqual({ sortBy: "folio", sortDirection: "asc" })
    expect(readOrderSort({ sortBy: "folio,id", sortDirection: "asc" })).toEqual(
      { sortBy: "date_created", sortDirection: "asc" }
    )
    expect(
      readOrderSort({ sortBy: "folio", sortDirection: ["desc", "asc"] })
    ).toEqual({ sortBy: "folio", sortDirection: "desc" })
  })

  beforeEach(() => {
    request.mockReset()
    createPrivateDirectus.mockClear()
  })

  it("lists orders with the minimal explicit client, scale, and technician projection", async () => {
    request.mockResolvedValue([listOrder])

    await expect(
      getOrdersRepository({ accessToken: "employee-token-a" })
    ).resolves.toEqual([listOrder])

    expect(request).toHaveBeenCalledTimes(1)
    expect(request.mock.calls[0][0]).toEqual({
      collection: "order",
      fields: [
        "id",
        "folio",
        "date_created",
        "status",
        { client: ["id", "name"] },
        { scales: [{ scales_id: ["id", "title", "serial_number"] }] },
        { technician_name: ["first_name", "last_name"] },
      ],
      deep: { scales: { _sort: ["sort"] } },
      limit: 10,
      page: 1,
      sort: ["-date_created", "id"],
    })
  })

  it.each([
    {
      sortBy: "date_created" as const,
      sortDirection: "asc" as const,
      expected: ["date_created", "id"],
    },
    {
      sortBy: "date_created" as const,
      sortDirection: "desc" as const,
      expected: ["-date_created", "id"],
    },
    {
      sortBy: "folio" as const,
      sortDirection: "asc" as const,
      expected: ["folio", "id"],
    },
    {
      sortBy: "folio" as const,
      sortDirection: "desc" as const,
      expected: ["-folio", "id"],
    },
  ])(
    "uses a whitelisted global sort %#",
    async ({ sortBy, sortDirection, expected }) => {
      request.mockResolvedValue([listOrder])

      await getOrdersRepository({
        accessToken: "employee-token",
        sortBy,
        sortDirection,
        page: 2,
        limit: 5,
      })

      expect(request.mock.calls[0][0]).toMatchObject({
        sort: expected,
        limit: 5,
        page: 2,
      })
    }
  )

  it.each([
    { sortBy: "status" as never },
    { sortBy: "folio,id" as never },
    { sortDirection: "random" as never },
  ])(
    "rejects invalid sort query %# before creating a Directus client",
    async (query) => {
      await expect(
        getOrdersRepository({ accessToken: "employee-token", ...query })
      ).rejects.toThrow()

      expect(createPrivateDirectus).not.toHaveBeenCalled()
      expect(request).not.toHaveBeenCalled()
    }
  )

  it("applies status, folio-or-authorized-client-name search, and date filters before pagination", async () => {
    request.mockResolvedValue([listOrder])

    await getOrdersRepository({
      accessToken: "employee-token",
      status: "paid",
      search: "  folio  ",
      dateFilter: { mode: "period", startDate: "2026-01-02" },
      page: 3,
      limit: 7,
    })

    expect(request.mock.calls[0][0]).toMatchObject({
      filter: {
        _and: [
          { status: { _eq: "paid" } },
          {
            _or: [
              { folio: { _icontains: "folio" } },
              { client: { name: { _icontains: "folio" } } },
            ],
          },
          {
            date_created: {
              _gte: "2026-01-02T06:00:00.000Z",
              _lt: "2026-01-03T06:00:00.000Z",
            },
          },
        ],
      },
      limit: 7,
      page: 3,
      sort: ["-date_created", "id"],
    })
  })

  it("reads a read-only detail by id with existing fields and validates status after read", async () => {
    request.mockResolvedValue(order)

    await expect(
      getOrderRepository({ accessToken: "employee-token-b", id: "order-1" })
    ).resolves.toEqual(order)

    expect(request.mock.calls[0][0]).toEqual({
      collection: "order",
      id: "order-1",
      fields: [
        "id",
        "folio",
        "date_created",
        "status",
        { client: ["id", "name"] },
        { scales: [{ scales_id: ["id", "title", "serial_number"] }] },
        { technician_name: ["first_name", "last_name"] },
        "description",
        "client_name",
        "client_department",
      ],
      deep: { scales: { _sort: ["sort"] } },
    })
  })

  it.each([null, "archived", undefined])(
    "rejects an order whose post-read status is %s",
    async (status) => {
      request.mockResolvedValue({ ...order, status })

      await expect(
        getOrderRepository({ accessToken: "employee-token", id: "order-1" })
      ).resolves.toBeNull()
    }
  )

  it.each([
    { limit: 0 },
    { limit: -1 },
    { limit: 1.5 },
    { limit: 101 },
    { page: 0 },
    { page: -1 },
    { page: 1.5 },
    { page: Number.MAX_SAFE_INTEGER },
    { page: Number.MAX_SAFE_INTEGER + 1 },
    { status: "pending" as never },
    { search: "x".repeat(101) },
    {
      dateFilter: {
        mode: "specific" as const,
        dates: Array.from(
          { length: 32 },
          (_, index) => `2026-01-${String(index + 1).padStart(2, "0")}`
        ),
      },
    },
    { dateFilter: { mode: "period", startDate: "2026-02-30" } as never },
  ])(
    "rejects invalid list query %# before creating a Directus client",
    async (query) => {
      await expect(
        getOrdersRepository({ accessToken: "employee-token", ...query })
      ).rejects.toThrow()

      expect(createPrivateDirectus).not.toHaveBeenCalled()
      expect(request).not.toHaveBeenCalled()
    }
  )

  it("accepts the maximum bounded search and specific-day filter", async () => {
    request.mockResolvedValue([listOrder])
    const dates = Array.from(
      { length: 31 },
      (_, index) => `2026-01-${String(index + 1).padStart(2, "0")}`
    )

    await getOrdersRepository({
      accessToken: "employee-token",
      search: "x".repeat(100),
      dateFilter: { mode: "specific", dates },
    })

    expect(request).toHaveBeenCalledTimes(1)
    expect(request.mock.calls[0][0].filter).toMatchObject({
      _and: [
        { _or: expect.any(Array) },
        { _or: expect.arrayContaining([expect.any(Object)]) },
      ],
    })
    expect(request.mock.calls[0][0].filter._and[1]._or).toHaveLength(31)
  })

  it("applies filters independently and does not filter the default all-status tab", async () => {
    request.mockResolvedValue([listOrder])

    await getOrdersRepository({
      accessToken: "employee-token",
      status: "all",
      search: "Báscula",
      dateFilter: {
        mode: "specific",
        dates: ["2026-01-02", "2026-01-05"],
      },
    })

    expect(request.mock.calls[0][0]).toMatchObject({
      filter: {
        _and: [
          {
            _or: [
              { folio: { _icontains: "Báscula" } },
              { client: { name: { _icontains: "Báscula" } } },
            ],
          },
          {
            _or: [
              {
                date_created: {
                  _gte: "2026-01-02T06:00:00.000Z",
                  _lt: "2026-01-03T06:00:00.000Z",
                },
              },
              {
                date_created: {
                  _gte: "2026-01-05T06:00:00.000Z",
                  _lt: "2026-01-06T06:00:00.000Z",
                },
              },
            ],
          },
        ],
      },
    })
  })

  it("passes distinct employee tokens to their own private requests", async () => {
    request.mockResolvedValueOnce([listOrder]).mockResolvedValueOnce(order)

    await getOrdersRepository({ accessToken: "employee-a" })
    await getOrderRepository({ accessToken: "employee-b", id: "order-1" })

    expect(createPrivateDirectus).toHaveBeenNthCalledWith(1, "employee-a")
    expect(createPrivateDirectus).toHaveBeenNthCalledWith(2, "employee-b")
  })

  it("propagates denied list and detail reads and a service failure", async () => {
    request
      .mockRejectedValueOnce(new Error("FORBIDDEN"))
      .mockRejectedValueOnce(new Error("FORBIDDEN"))
      .mockRejectedValueOnce(new Error("SERVICE_UNAVAILABLE"))

    await expect(
      getOrdersRepository({ accessToken: "employee-list" })
    ).rejects.toThrow("FORBIDDEN")
    await expect(
      getOrderRepository({ accessToken: "employee-detail", id: "order-1" })
    ).rejects.toThrow("FORBIDDEN")
    await expect(
      getOrdersRepository({ accessToken: "employee-service" })
    ).rejects.toThrow("SERVICE_UNAVAILABLE")

    expect(createPrivateDirectus).toHaveBeenNthCalledWith(1, "employee-list")
    expect(createPrivateDirectus).toHaveBeenNthCalledWith(2, "employee-detail")
    expect(createPrivateDirectus).toHaveBeenNthCalledWith(3, "employee-service")
  })
})
