import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SafeHtml } from "@/components/shared/content/SafeHtml"

describe("SafeHtml", () => {
  it("removes malicious singleton HTML while preserving safe markup", () => {
    const html = renderToStaticMarkup(
      createElement(SafeHtml, {
        content:
          '<img src="x" onerror="alert(1)"><script>alert(1)</script><p><strong>Safe content</strong></p>',
      })
    )

    expect(html).not.toContain("<script")
    expect(html).not.toContain("onerror")
    expect(html).toContain("<p><strong>Safe content</strong></p>")
  })
})
