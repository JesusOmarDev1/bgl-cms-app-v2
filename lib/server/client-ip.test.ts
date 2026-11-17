import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({ headers: vi.fn() }))

import { headers } from "next/headers"
import { getClientIp, getClientIpTrusted } from "@/lib/server/client-ip"

function forwardedFor(value?: string) {
  vi.mocked(headers).mockResolvedValue(
    new Headers(
      value === undefined ? {} : { "x-forwarded-for": value }
    ) as never
  )
}

afterEach(() => {
  vi.clearAllMocks()
})

describe("getClientIp", () => {
  it("returns the single forwarded hop, trimmed and normalized", async () => {
    forwardedFor("  ::FFFF:203.0.113.4  ")

    await expect(getClientIp()).resolves.toBe("203.0.113.4")
  })

  it("refuses a multi-hop header", async () => {
    forwardedFor("203.0.113.4, 10.0.0.1")

    await expect(getClientIp()).resolves.toBeUndefined()
  })

  it("returns undefined without a header or with an empty one", async () => {
    forwardedFor()
    await expect(getClientIp()).resolves.toBeUndefined()

    forwardedFor("   ")
    await expect(getClientIp()).resolves.toBeUndefined()
  })
})

describe("getClientIpTrusted", () => {
  it("returns the only hop when the header is single-hop", async () => {
    forwardedFor("::ffff:203.0.113.4")

    await expect(getClientIpTrusted()).resolves.toBe("203.0.113.4")
  })

  it("takes the last hop of a multi-hop header", async () => {
    forwardedFor("203.0.113.4, 10.0.0.1")

    await expect(getClientIpTrusted()).resolves.toBe("10.0.0.1")
  })

  it("returns undefined without a header or with an empty one", async () => {
    forwardedFor()
    await expect(getClientIpTrusted()).resolves.toBeUndefined()

    forwardedFor(" ,  ")

    await expect(getClientIpTrusted()).resolves.toBeUndefined()
  })
})
