import { beforeEach, describe, expect, it, vi } from "vitest"

const { request, publicRequest, createPrivateDirectus } = vi.hoisted(() => ({
  request: vi.fn(),
  publicRequest: vi.fn(),
  createPrivateDirectus: vi.fn(async (_accessToken: string) => ({ request })),
}))
vi.mock("server-only", () => ({}))
vi.mock("@directus/sdk", () => ({
  readItems: vi.fn((collection: string, query: object) => ({ collection, ...query })),
}))
vi.mock("@/config/directus-private", () => ({ createPrivateDirectus }))
vi.mock("@/config/directus-public", () => ({ publicDirectus: { request: publicRequest } }))
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }))

import { getPrivateClientsRepository } from "@/services/domain/db/repositories/collections/private-clients"
import { getClientsQuery } from "@/services/domain/db/queries/collections/clients/clients"

describe("private client repository", () => {
  beforeEach(() => {
    request.mockReset()
    publicRequest.mockReset()
    createPrivateDirectus.mockClear()
  })

  it("uses the employee token and applies search on the server before pagination", async () => {
    const clients = Array.from({ length: 11 }, (_, index) => ({
      id: `client-${index + 1}`,
      name: `Cliente ${index + 1}`,
    }))
    request.mockResolvedValue(clients)

    await expect(
      getPrivateClientsRepository({ accessToken: "employee-a", search: "uno", page: 2 })
    ).resolves.toEqual({ items: clients.slice(0, 10), hasNextPage: true })

    expect(createPrivateDirectus).toHaveBeenCalledWith("employee-a")
    expect(request).toHaveBeenCalledWith({
      collection: "clients",
      fields: ["id", "name"],
      filter: { name: { _icontains: "uno" } },
      limit: 11,
      offset: 10,
      sort: ["name", "id"],
    })
  })

  it.each([{ limit: 0 }, { limit: -1 }, { limit: 1.5 }, { page: 0 }, { page: 1.5 }])(
    "rejects invalid pagination before creating a private client: %o",
    async (query) => {
      await expect(
        getPrivateClientsRepository({ accessToken: "employee-a", ...query })
      ).rejects.toThrow()
      expect(createPrivateDirectus).not.toHaveBeenCalled()
      expect(request).not.toHaveBeenCalled()
    }
  )

  it("preserves the existing public published-client query", async () => {
    const publicClients = [{ id: "public-1", name: "Cliente público" }]
    publicRequest.mockResolvedValue(publicClients)

    await expect(
      getClientsQuery({}, "failed")
    ).resolves.toEqual(publicClients)

    expect(publicRequest.mock.calls[0][0]).toMatchObject({
      collection: "clients",
      limit: 10,
      page: 1,
      sort: ["-date_created"],
      filter: { status: { _eq: "published" } },
    })
    expect(createPrivateDirectus).not.toHaveBeenCalled()
  })

  it("propagates authorization and transport failures instead of returning empty data", async () => {
    request.mockRejectedValueOnce(new Error("FORBIDDEN"))
      .mockRejectedValueOnce(new Error("SERVICE_UNAVAILABLE"))

    await expect(
      getPrivateClientsRepository({ accessToken: "employee-a" })
    ).rejects.toThrow("FORBIDDEN")
    await expect(
      getPrivateClientsRepository({ accessToken: "employee-a" })
    ).rejects.toThrow("SERVICE_UNAVAILABLE")
  })
})
