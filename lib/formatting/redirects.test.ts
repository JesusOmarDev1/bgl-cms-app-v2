import { describe, expect, it } from "vitest"
import { matchRedirect } from "@/lib/formatting/redirects"

describe("matchRedirect", () => {
  it("does not redirect a path to itself", () => {
    expect(
      matchRedirect(
        new URL("https://example.com/old"),
        [{ origin: "/old", destiny: "/old/", http_code: "301" }],
        null
      )
    ).toBeNull()
  })
})
