import { afterEach, describe, expect, it, vi } from "vitest"
import { createLogger } from "@/lib/directus/logger"
import type { LogContext } from "@/types/shared/logger/log-context"

vi.mock("server-only", () => ({}))

describe("createLogger", () => {
  afterEach(() => vi.restoreAllMocks())

  it("emits only allowlisted safe metadata, even at debug level", () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {})
    const logger = createLogger("debug")

    logger.debug("query failed: person@example.com", {
      component: "db.queries",
      operation: "getPagesQuery",
      collection: "pages",
      code: "FORBIDDEN",
      status: 403,
      message: "token=top-secret",
      details: { headers: { authorization: "Bearer top-secret" } },
    } as LogContext)

    expect(debug).toHaveBeenCalledTimes(1)
    const args = debug.mock.calls[0]
    expect(args.join(" ")).not.toContain("person@example.com")
    expect(args.join(" ")).not.toContain("top-secret")
    expect(args.join(" ")).toContain("db.queries")
    expect(args.join(" ")).not.toContain("getPagesQuery")
    expect(args.join(" ")).toContain("pages")
    expect(args.join(" ")).toContain("FORBIDDEN")
    expect(args.join(" ")).toContain("403")
    expect(args).toHaveLength(1)
  })

  it("drops alphanumeric credential-like values from every metadata field", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const logger = createLogger("debug")
    const secrets = ["password", "bearersecret", "topsecret", "BEARER_SECRET"]

    logger.error("safe event", {
      component: secrets[0],
      operation: secrets[1],
      collection: secrets[2],
      code: secrets[3],
    })

    const args = error.mock.calls.flat().join(" ")
    for (const secret of secrets) expect(args).not.toContain(secret)
    expect(error.mock.calls[0]).toHaveLength(1)
  })

  it("filters events below the configured severity", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const logger = createLogger("warn")

    logger.info("safe event", { component: "db.queries" })
    logger.warn("safe warning", { component: "db.queries" })

    expect(log).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain("WARN")
  })
})
