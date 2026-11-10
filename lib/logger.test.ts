import { afterEach, describe, expect, it, vi } from "vitest"
import { createLogger } from "@/lib/logger"
import type { LogLevel } from "@/types/enums/log-level"

describe("createLogger", () => {
  afterEach(() => vi.restoreAllMocks())

  it("formats generic context and keeps throttling isolated per instance", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(performance, "now").mockReturnValue(100)
    const options = {
      throttleMs: 1_000,
      format: (level: string, message: string, context?: { scope: string }) =>
        `${level}: ${message} (${context?.scope})`,
      throttleKey: (_level: LogLevel, context?: { scope: string }) =>
        context?.scope,
    }
    const first = createLogger("info", options)
    const second = createLogger("info", options)

    first.info("ready", { scope: "catalog" })
    first.info("duplicate", { scope: "catalog" })
    second.info("ready", { scope: "catalog" })

    expect(log.mock.calls).toEqual([
      ["info: ready (catalog)"],
      ["info: ready (catalog)"],
    ])
  })
})
