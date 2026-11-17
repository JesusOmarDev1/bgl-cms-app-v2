import { beforeEach, describe, expect, it, vi } from "vitest"

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock("server-only", () => ({}))
vi.mock("@directus/sdk", () => ({
  readItem: vi.fn((collection: string, id: string, query: object) => ({
    collection,
    id,
    ...query,
  })),
}))
vi.mock("@/config/directus-public", () => ({ publicDirectus: { request } }))
vi.mock("@/lib/directus/query-error", () => ({
  returnDirectusQueryError: vi.fn(),
}))

import { getPublishedFormBlockQuery } from "@/services/domain/db/queries/collections/form-block/form-block"

const published = {
  id: "form-1",
  status: "published",
  captcha: false,
  fields: [],
}

describe("getPublishedFormBlockQuery", () => {
  beforeEach(() => {
    request.mockReset()
  })

  it("returns a published form block", async () => {
    request.mockResolvedValue(published)

    await expect(getPublishedFormBlockQuery("form-1", "failed")).resolves.toBe(
      published
    )
  })

  it("drops a draft form block the read still returns", async () => {
    request.mockResolvedValue({ ...published, status: "draft" })

    await expect(
      getPublishedFormBlockQuery("form-1", "failed")
    ).resolves.toBeNull()
  })

  it("drops a form block without a status", async () => {
    request.mockResolvedValue({ ...published, status: null })

    await expect(
      getPublishedFormBlockQuery("form-1", "failed")
    ).resolves.toBeNull()
  })
})
