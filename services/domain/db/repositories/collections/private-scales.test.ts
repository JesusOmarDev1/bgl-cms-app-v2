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
}))
vi.mock("@/config/directus-private", () => ({ createPrivateDirectus }))

import { getPrivateScalesRepository } from "@/services/domain/db/repositories/collections/private-scales"

describe("private scale repository", () => {
  beforeEach(() => {
    request.mockReset()
    createPrivateDirectus.mockClear()
  })

  it("filters by the assigned client on the server and excludes unassigned scales", async () => {
    const scales = [
      {
        id: "scale-1",
        title: "Báscula",
        serial_number: "S-1",
        client: "client-a",
      },
    ]
    request.mockResolvedValue(scales)

    await expect(
      getPrivateScalesRepository({
        accessToken: "employee-a",
        clientId: "client-a",
      })
    ).resolves.toEqual({ items: scales, hasNextPage: false })

    expect(createPrivateDirectus).toHaveBeenCalledWith("employee-a")
    expect(request).toHaveBeenCalledWith({
      collection: "scales",
      fields: [
        "id",
        "title",
        "serial_number",
        "identification",
        "status",
        { client: ["id", "name"] },
      ],
      filter: { client: { _eq: "client-a" } },
      limit: 11,
      offset: 0,
      sort: ["title", "id"],
    })
  })

  it("searches serial and identification and applies the optional status filter server-side", async () => {
    request.mockResolvedValue([])

    await getPrivateScalesRepository({
      accessToken: "employee-b",
      search: "s-1",
      status: "active",
      page: 3,
    })

    expect(request).toHaveBeenCalledWith({
      collection: "scales",
      fields: [
        "id",
        "title",
        "serial_number",
        "identification",
        "status",
        { client: ["id", "name"] },
      ],
      filter: {
        _and: [
          {
            _or: [
              { serial_number: { _icontains: "s-1" } },
              { identification: { _icontains: "s-1" } },
            ],
          },
          { status: { _eq: "active" } },
        ],
      },
      limit: 11,
      offset: 20,
      sort: ["title", "id"],
    })
  })

  it("searches an identification value and combines assigned-client filtering", async () => {
    request.mockResolvedValue([])

    await getPrivateScalesRepository({
      accessToken: "employee-b",
      search: "ID-7",
      clientId: "client-a",
    })

    expect(request.mock.calls[0][0].filter).toEqual({
      _and: [
        {
          _or: [
            { serial_number: { _icontains: "ID-7" } },
            { identification: { _icontains: "ID-7" } },
          ],
        },
        { client: { _eq: "client-a" } },
      ],
    })
  })

  it.each([
    { limit: 0 },
    { limit: -1 },
    { limit: 1.5 },
    { page: 0 },
    { page: 1.5 },
  ])(
    "rejects invalid pagination before creating a private client: %o",
    async (query) => {
      await expect(
        getPrivateScalesRepository({ accessToken: "employee-a", ...query })
      ).rejects.toThrow()
      expect(createPrivateDirectus).not.toHaveBeenCalled()
      expect(request).not.toHaveBeenCalled()
    }
  )

  it("propagates denied reads instead of returning an empty list", async () => {
    request.mockRejectedValue(new Error("FORBIDDEN"))

    await expect(
      getPrivateScalesRepository({ accessToken: "employee-a" })
    ).rejects.toThrow("FORBIDDEN")
  })
})
