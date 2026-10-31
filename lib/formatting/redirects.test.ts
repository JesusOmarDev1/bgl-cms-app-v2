import { describe, expect, it } from "vitest"
import { matchRedirect } from "@/lib/formatting/redirects"

describe("matchRedirect", () => {
<<<<<<< HEAD
  it("resolves a same-site redirect with its configured status", () => {
    expect(
      matchRedirect(
        new URL("/", "http://localhost:3000"),
        [{ origin: "/", destiny: "/inicio", http_code: "301" }],
        null
      )
    ).toEqual({
      location: new URL("/inicio", "http://localhost:3000"),
      status: 301,
    })
  })

  it("rejects an off-site destination", () => {
    expect(
      matchRedirect(
        new URL("/", "http://localhost:3000"),
        [{ origin: "/", destiny: "https://evil.example/x", http_code: "302" }],
=======
  it("does not redirect a path to itself", () => {
    expect(
      matchRedirect(
        new URL("https://example.com/old"),
        [{ origin: "/old", destiny: "/old/", http_code: "301" }],
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
        null
      )
    ).toBeNull()
  })
})
