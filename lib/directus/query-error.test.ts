import { afterEach, describe, expect, it, vi } from "vitest"

const { errorLog, warnLog } = vi.hoisted(() => ({
  errorLog: vi.fn(),
  warnLog: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/directus/logger", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/directus/logger")>()),
  directusLogger: { error: errorLog, warn: warnLog },
}))

import { returnDirectusQueryError } from "@/lib/directus/query-error"

describe("returnDirectusQueryError", () => {
  afterEach(() => vi.clearAllMocks())

  it("selects safe diagnostics from multiple SDK errors without forwarding raw data", () => {
    const secret = "person@example.com password=top-secret"
    const result = returnDirectusQueryError(
      {
        message: secret,
        errors: [
          { message: secret, extensions: { code: "FORBIDDEN", status: 403 } },
          {
            message: "Authorization: Bearer top-secret",
            extensions: { code: "INVALID_TOKEN", status: 401 },
          },
        ],
        response: {
          status: 403,
          headers: { authorization: "Bearer top-secret" },
          body: secret,
        },
      },
      `Could not load ${secret}`,
      {
        component: "db.queries",
        operation: "getPagesQuery",
        collection: "pages",
      }
    )

    expect(result).toBeUndefined()
    expect(warnLog).toHaveBeenCalledTimes(1)
    const [message, context] = warnLog.mock.calls[0]
    expect(message).not.toContain(secret)
    expect(JSON.stringify(context)).not.toContain("top-secret")
    expect(context).toMatchObject({
      component: "db.queries",
      operation: "getPagesQuery",
      collection: "pages",
      code: "FORBIDDEN",
      status: 403,
    })
    expect(context).not.toHaveProperty("details")
    expect(context).not.toHaveProperty("message")
  })

  it("uses response status and keeps mixed warning/error incidents at error severity", () => {
    returnDirectusQueryError(
      {
        message: "private response data",
        errors: [
          { message: "denied", extensions: { code: "FORBIDDEN", status: 403 } },
          {
            message: "server failure",
            extensions: { code: "INTERNAL_SERVER_ERROR", status: 500 },
          },
        ],
        response: { status: 502 },
      },
      "safe failure",
      {
        component: "db.queries",
        operation: "getPagesQuery",
        collection: "pages",
      }
    )

    expect(warnLog).not.toHaveBeenCalled()
    expect(errorLog).toHaveBeenCalledTimes(1)
    expect(errorLog.mock.calls[0][1]).toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      status: 502,
    })
  })

  it("preserves the void fallback path when a valid SDK error has no response", () => {
    expect(() =>
      returnDirectusQueryError(
        {
          message: "private SDK message",
          errors: [{ message: "denied", extensions: { code: "FORBIDDEN" } }],
        },
        "safe failure",
        { component: "db.queries", operation: "getPagesQuery" }
      )
    ).not.toThrow()

    expect(warnLog).toHaveBeenCalledTimes(1)
    expect(warnLog.mock.calls[0][1]).toMatchObject({
      code: "FORBIDDEN",
      status: undefined,
    })
  })

  it("handles invalid nested entries and empty SDK error arrays without throwing", () => {
    expect(() =>
      returnDirectusQueryError(
        {
          message: "private SDK message",
          errors: [
            { message: "denied", extensions: { code: "FORBIDDEN" } },
            { message: "malformed" },
          ],
        },
        "safe failure",
        { component: "db.queries", operation: "getPagesQuery" }
      )
    ).not.toThrow()
    expect(errorLog).toHaveBeenCalledTimes(1)
    expect(errorLog.mock.calls[0][1]).toMatchObject({
      code: "FORBIDDEN",
      status: undefined,
    })

    expect(() =>
      returnDirectusQueryError(
        { message: "private SDK message", errors: [] },
        "safe failure",
        { component: "db.queries", operation: "getPagesQuery" }
      )
    ).not.toThrow()
    expect(errorLog).toHaveBeenCalledTimes(2)
  })

  it("classifies nested ofetch SDK errors while keeping unknown Flow codes private", () => {
    const flowCode = "FLOW_CUSTOM_PRIVATE"
    returnDirectusQueryError(
      {
        response: { status: 403 },
        data: {
          errors: [
            { extensions: { code: "FORBIDDEN" }, message: "private payload" },
            { extensions: { code: flowCode }, message: "private detail" },
          ],
        },
      },
      "private caller message",
      { component: "db.queries", operation: "getPagesQuery" }
    )

    expect(warnLog).not.toHaveBeenCalled()
    expect(errorLog).toHaveBeenCalledTimes(1)
    const [message, context] = errorLog.mock.calls[0]
    expect(message).not.toContain(flowCode)
    expect(JSON.stringify(context)).not.toContain(flowCode)
    expect(context).toMatchObject({ code: "FORBIDDEN", status: 403 })
  })

  it("keeps unknown failures at error severity and emits safe diagnostics only", () => {
    const secret = "https://directus.test/items/pages?token=top-secret"
    returnDirectusQueryError(new Error(secret), secret, {
      component: "db.queries",
      operation: "getPagesQuery",
    })

    expect(errorLog).toHaveBeenCalledTimes(1)
    const [message, context] = errorLog.mock.calls[0]
    expect(message).not.toContain("top-secret")
    expect(JSON.stringify(context)).not.toContain("top-secret")
  })
})
