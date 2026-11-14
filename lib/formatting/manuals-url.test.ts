import { describe, expect, it } from "vitest"
import { isManualsUrl } from "./manuals-url"

describe("isManualsUrl", () => {
  it("matches the local manuals route and descendants only", () => {
    expect(isManualsUrl("/manuales", "https://site.example")).toBe(true)
    expect(
      isManualsUrl("/manuales/guia?pagina=2", "https://site.example")
    ).toBe(true)
    expect(
      isManualsUrl("https://site.example/manuales/guia", "https://site.example")
    ).toBe(true)
    expect(
      isManualsUrl(
        "https://other.example/manuales/guia",
        "https://site.example"
      )
    ).toBe(false)
    expect(
      isManualsUrl("/manuales-para-clientes", "https://site.example")
    ).toBe(false)
    expect(isManualsUrl("http://[", "https://site.example")).toBe(false)
    expect(isManualsUrl("/manuales", "https://[malformed")).toBe(true)
    expect(
      isManualsUrl("https://other.example/manuales", "https://[malformed")
    ).toBe(false)
    expect(isManualsUrl(null, "https://site.example")).toBe(false)
  })
})
