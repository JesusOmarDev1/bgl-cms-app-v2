import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}))
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}))
vi.mock("@/config/rate-limiter", () => ({
  formLimiter: { consume: vi.fn() },
}))
vi.mock("@/services/domain/db/repositories/collections/form-block", () => ({
  getPublishedFormBlockRepository: vi.fn(),
}))
vi.mock("@/services/domain/db/repositories/collections/form-responses", () => ({
  createFormResponseRepository: vi.fn(),
}))
vi.mock("@/lib/security/turnstile", () => ({ verifyTurnstile: vi.fn() }))

import { headers } from "next/headers"
import { formLimiter } from "@/config/rate-limiter"
import { getPublishedFormBlockRepository } from "@/services/domain/db/repositories/collections/form-block"
import { createFormResponseRepository } from "@/services/domain/db/repositories/collections/form-responses"
import { verifyTurnstile } from "@/lib/security/turnstile"
import { submitForm } from "@/services/domain/server/form/submit-form"

const formId = "00000000-0000-4000-8000-000000000000"

describe("submitForm rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "::ffff:203.0.113.4" })
    )
    vi.mocked(formLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(getPublishedFormBlockRepository).mockResolvedValue(null)
  })

  it("does not query the form when the limiter rejects", async () => {
    vi.mocked(formLimiter.consume).mockRejectedValue(new Error("limited"))

    await expect(submitForm({ formId, values: {} })).resolves.toEqual({
      data: { ok: false, message: "rate_limited" },
    })
    expect(formLimiter.consume).toHaveBeenCalledWith("203.0.113.4")
    expect(getPublishedFormBlockRepository).not.toHaveBeenCalled()
  })

  it("uses the normalized trusted IP before the form lookup", async () => {
    await expect(submitForm({ formId, values: {} })).resolves.toEqual({
      data: { ok: false, message: "not_found" },
    })
    expect(formLimiter.consume).toHaveBeenCalledWith("203.0.113.4")
    expect(getPublishedFormBlockRepository).toHaveBeenCalledWith(formId)
  })

  it("fails closed when the trusted IP header is missing", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers())

    await expect(submitForm({ formId, values: {} })).resolves.toEqual({
      data: { ok: false, message: "rate_limited" },
    })
    expect(formLimiter.consume).not.toHaveBeenCalled()
    expect(getPublishedFormBlockRepository).not.toHaveBeenCalled()
  })
})

describe("submitForm persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.4" })
    )
    vi.mocked(formLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(getPublishedFormBlockRepository).mockResolvedValue({
      captcha: false,
      fields: [
        {
          collection: "text_block",
          item: { identifier: "name", required: true },
        },
      ],
    } as never)
    vi.mocked(createFormResponseRepository).mockResolvedValue({
      id: "response-1",
    } as never)
  })

  it("persists validated values", async () => {
    await expect(
      submitForm({ formId, values: { name: "Ada" } })
    ).resolves.toEqual({
      data: { ok: true },
    })
    expect(createFormResponseRepository).toHaveBeenCalledWith({
      form: formId,
      answer: { name: "Ada" },
    })
  })

  it("does not persist invalid values", async () => {
    await expect(
      submitForm({ formId, values: { name: "" } })
    ).resolves.toMatchObject({
      data: {
        ok: false,
        message: "invalid",
        fieldErrors: { name: expect.any(String) },
      },
    })
    expect(createFormResponseRepository).not.toHaveBeenCalled()
  })

  it("does not persist when captcha verification fails", async () => {
    vi.mocked(getPublishedFormBlockRepository).mockResolvedValue({
      captcha: true,
      fields: [
        {
          collection: "text_block",
          item: { identifier: "name", required: true },
        },
      ],
    } as never)
    vi.mocked(verifyTurnstile).mockResolvedValue(false)

    await expect(
      submitForm({ formId, values: { name: "Ada" }, captchaToken: "bad" })
    ).resolves.toEqual({
      data: { ok: false, message: "captcha_failed" },
    })
    expect(verifyTurnstile).toHaveBeenCalledWith("bad")
    expect(createFormResponseRepository).not.toHaveBeenCalled()
  })
})
