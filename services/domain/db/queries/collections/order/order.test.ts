import { beforeEach, describe, expect, it, vi } from "vitest"

const { request, createPrivateDirectus } = vi.hoisted(() => ({
  request: vi.fn(),
  createPrivateDirectus: vi.fn(async (_accessToken: string) => ({ request })),
}))
vi.mock("server-only", () => ({}))
vi.mock("@directus/sdk", () => ({
  readItems: vi.fn((collection: string, query: object) => ({
    collection,
    ...query,
  })),
  readItem: vi.fn((collection: string, id: string, query: object) => ({
    collection,
    id,
    ...query,
  })),
}))
vi.mock("@/config/directus-private", () => ({ createPrivateDirectus }))

import { getOrdersQuery } from "@/services/domain/db/queries/collections/order/order"

describe("getOrdersQuery sorting", () => {
  beforeEach(() => {
    request.mockReset().mockResolvedValue([])
    createPrivateDirectus.mockClear()
  })

  it("sorts globally before requested server pagination while preserving filters", async () => {
    await getOrdersQuery("employee-token", {
      sortBy: "folio",
      sortDirection: "desc",
      status: "paid",
      search: "folio-1",
      dateFilter: { mode: "period", startDate: "2026-01-02" },
      page: 3,
      limit: 7,
    })

    expect(request.mock.calls[0][0]).toMatchObject({
      sort: ["-folio", "id"],
      limit: 7,
      page: 3,
      filter: {
        _and: [
          { status: { _eq: "paid" } },
          {
            _or: [
              { folio: { _icontains: "folio-1" } },
              { client: { name: { _icontains: "folio-1" } } },
            ],
          },
          { date_created: { _gte: "2026-01-02T06:00:00.000Z" } },
        ],
      },
    })
  })

  it.each([
    { sortBy: "status" },
    { sortBy: "folio,id" },
    { sortDirection: "sideways" },
  ])(
    "rejects untrusted sort input %# before creating a Directus client",
    async (sort) => {
      await expect(
        getOrdersQuery("employee-token", sort as never)
      ).rejects.toThrow(RangeError)

      expect(createPrivateDirectus).not.toHaveBeenCalled()
      expect(request).not.toHaveBeenCalled()
    }
  )
})
