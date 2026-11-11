import { afterEach, describe, expect, it, vi } from "vitest"
import { createLogger } from "@/lib/directus/logger"
import { createDirectusTraceFetch } from "@/lib/directus/request-trace"

vi.mock("server-only", () => ({}))

describe("createDirectusTraceFetch", () => {
  afterEach(() => vi.restoreAllMocks())

  it("traces start and success at debug without exposing request or response data", async () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {})
    const body = "person@example.com secret-payload"
    const response = new Response(body, { status: 200 })
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response)
    const tracedFetch = createDirectusTraceFetch(
      fetcher,
      createLogger("debug", 60_000)
    )

    const result = await tracedFetch(
      "https://cms.example/items/form_responses?filter[email]=person@example.com&access_token=secret-token",
      {
        method: "POST",
        headers: { Authorization: "Bearer secret-token" },
        body,
      }
    )

    expect(result).toBe(response)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(await result.text()).toBe(body)
    expect(debug).toHaveBeenCalledTimes(2)
    expect(
      debug.mock.calls.map(
        ([line]) => line.match(/request\.(?:start|success|failure)/)?.[0]
      )
    ).toEqual(["request.start", "request.success"])
    const args = debug.mock.calls.flat().join(" ")
    for (const secret of [
      "cms.example",
      "form_responses?",
      "person@example.com",
      "secret-token",
      body,
    ]) {
      expect(args).not.toContain(secret)
    }
    expect(args).toContain("request.start")
    expect(args).toContain("request.success")
    expect(args).toContain("form_responses")
  })

  it("traces client-side 4xx failures at debug level", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {})
    const response = new Response('{"errors":[{"message":"private detail"}]}', {
      status: 403,
    })
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response)
    // At level "info" the suppressed debug target emits nothing; "debug" shows
    // which target the trace picked while still failing if it picked info.
    const tracedFetch = createDirectusTraceFetch(
      fetcher,
      createLogger("debug", 60_000)
    )

    const result = await tracedFetch(
      "https://cms.example/items/pages?secret=value"
    )

    expect(result).toBe(response)
    expect(result.status).toBe(403)
    // 4xx failures are expected denials in the private area: debug, not info.
    // At level "debug" both start and failure traces are visible.
    expect(debug).toHaveBeenCalledTimes(2)
    expect(log).not.toHaveBeenCalled()
    expect(debug.mock.calls[1][0]).toMatch(/request\.failure/)
    const args = debug.mock.calls.flat().join(" ")
    expect(args).toContain("request.failure")
    expect(args).toContain("403")
    expect(args).not.toContain("private detail")
    expect(args).not.toContain("secret=value")
  })

  it("traces server-side 5xx failures at info level", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {})
    const response = new Response("{}", { status: 503 })
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response)
    const tracedFetch = createDirectusTraceFetch(
      fetcher,
      createLogger("info", 60_000)
    )

    const result = await tracedFetch("https://cms.example/items/pages")

    expect(result).toBe(response)
    expect(log).toHaveBeenCalledTimes(1)
    expect(log.mock.calls[0][0]).toMatch(/request\.failure/)
    expect(log.mock.calls.flat().join(" ")).toContain("503")
    expect(debug).not.toHaveBeenCalled()
  })

  it("traces and rethrows transport failures without logging error details", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {})
    const error = new Error("secret-token person@example.com")
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(error)
    const tracedFetch = createDirectusTraceFetch(
      fetcher,
      createLogger("info", 60_000)
    )

    await expect(tracedFetch("https://cms.example/items/pages")).rejects.toBe(
      error
    )

    expect(log).toHaveBeenCalledTimes(1)
    expect(log.mock.calls[0][0]).toMatch(/request\.failure/)
    expect(debug).not.toHaveBeenCalled()
    const args = log.mock.calls.flat().join(" ")
    expect(args).toContain("request.failure")
    expect(args).not.toContain("secret-token")
    expect(args).not.toContain("person@example.com")
  })

  it("does not emit start or success traces at info level", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}"))
    const tracedFetch = createDirectusTraceFetch(
      fetcher,
      createLogger("info", 60_000)
    )

    await tracedFetch("https://cms.example/items/pages")
    await tracedFetch("https://cms.example/items/pages")

    expect(log).not.toHaveBeenCalled()
  })

  it("suppresses all request traces at warn and error levels", async () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {})
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}"))

    for (const level of ["warn", "error"] as const) {
      await createDirectusTraceFetch(
        fetcher,
        createLogger(level)
      )("https://cms.example/items/pages")
    }

    expect(debug).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })
})
