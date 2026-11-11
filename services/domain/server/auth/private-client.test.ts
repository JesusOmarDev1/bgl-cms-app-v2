import { afterEach, describe, expect, it, vi } from "vitest"
import { readMe } from "@directus/sdk"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/env/constants", () => ({
  DIRECTUS_URL: "https://directus.test",
  DIRECTUS_STATIC_TOKEN: "public-site-token",
  DIRECTUS_LOG_LEVEL: undefined,
}))

import { createPrivateDirectus } from "@/config/directus-private"

afterEach(() => vi.restoreAllMocks())

describe("private Directus client", () => {
  it("isolates two interleaved employee requests without using the public token", async () => {
    const seen: { authorization: string | null; cache: RequestCache }[] = []
    const finish: (() => void)[] = []
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const request = new Request(input, init)
      const authorization = request.headers.get("authorization")
      seen.push({ authorization, cache: request.cache })
      await new Promise<void>((resolve) => finish.push(resolve))
      return Response.json({ data: { id: authorization?.slice(7) } })
    })

    const [aClient, bClient] = await Promise.all([
      createPrivateDirectus("employee-A"),
      createPrivateDirectus("employee-B"),
    ])
    const aRequest = aClient.request(readMe({ fields: ["id"] }))
    const bRequest = bClient.request(readMe({ fields: ["id"] }))
    await vi.waitFor(() => expect(finish).toHaveLength(2))
    finish[1]()
    finish[0]()
    const [a, b] = await Promise.all([aRequest, bRequest])

    expect([a.id, b.id]).toEqual(["employee-A", "employee-B"])
    expect(seen).toEqual([
      { authorization: "Bearer employee-A", cache: "no-store" },
      { authorization: "Bearer employee-B", cache: "no-store" },
    ])
    expect(
      seen.some(({ authorization }) =>
        authorization?.includes("public-site-token")
      )
    ).toBe(false)
  })

  it("rejects a missing employee token instead of falling back to public access", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    await expect(createPrivateDirectus("")).rejects.toThrow(
      "Missing employee token"
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
