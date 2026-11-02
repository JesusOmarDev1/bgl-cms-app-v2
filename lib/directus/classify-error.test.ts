import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import { classifyDirectusError } from "@/lib/directus/classify-error"

describe("classifyDirectusError", () => {
  it("prioritizes session identity over forbidden codes", () => {
    expect(
      classifyDirectusError({
        errors: [
          { extensions: { code: "FORBIDDEN" } },
          { extensions: { code: "TOKEN_EXPIRED" } },
        ],
        response: { status: 403 },
      }).category
    ).toBe("sessionExpired")
  })

  it("classifies forbidden responses without implying resource existence", () => {
    expect(classifyDirectusError({ response: { status: 403 } })).toMatchObject({
      category: "accessDenied",
      status: 403,
    })
  })

  it("prioritizes unavailable failures over validation errors", () => {
    expect(
      classifyDirectusError({
        errors: [
          { extensions: { code: "FAILED_VALIDATION" } },
          { extensions: { code: "SERVICE_UNAVAILABLE" } },
        ],
      }).category
    ).toBe("unavailable")
  })

  it("classifies validation and rate limiting distinctly", () => {
    expect(
      classifyDirectusError({
        errors: [{ extensions: { code: "INVALID_PAYLOAD" } }],
      }).category
    ).toBe("validationFailed")
    expect(classifyDirectusError({ response: { status: 429 } }).category).toBe(
      "rateLimited"
    )
  })

  it("extracts all codes from malformed SDK and nested ofetch errors safely", () => {
    const result = classifyDirectusError({
      errors: [
        { extensions: { code: "FLOW_PRIVATE_CUSTOM" } },
        { extensions: { code: "INVALID_PAYLOAD" } },
        null,
      ],
      data: {
        errors: [{ extensions: { code: "TOKEN_EXPIRED" } }],
        secret: "never expose this",
      },
    })

    expect(result).toMatchObject({
      category: "sessionExpired",
      unknownCode: true,
      malformedError: true,
      diagnosticCodes: ["INVALID_PAYLOAD", "TOKEN_EXPIRED"],
    })
    expect(JSON.stringify(result)).not.toContain("FLOW_PRIVATE_CUSTOM")
    expect(JSON.stringify(result)).not.toContain("never expose this")
  })

  it("accepts only valid HTTP status and marks transport failures", () => {
    expect(classifyDirectusError({ statusCode: 700 }).status).toBeUndefined()
    expect(
      classifyDirectusError(new TypeError("private network detail"))
    ).toMatchObject({
      category: "unavailable",
      transportFailure: true,
    })
  })

  it("does not mistake arbitrary custom Flow errors for transport failures", () => {
    expect(
      classifyDirectusError({
        errors: [{ extensions: { code: "CUSTOM_FLOW_FAILURE" } }],
      })
    ).toMatchObject({
      category: "generic",
      unknownCode: true,
      transportFailure: false,
    })
  })

  it("marks uncertain mutation outcomes without promising blind retries", () => {
    expect(
      classifyDirectusError(new TypeError("connection lost"), "mutation")
    ).toMatchObject({
      category: "resultUnknown",
      ambiguousMutationResult: true,
    })
    expect(
      classifyDirectusError(
        { errors: [{ extensions: { code: "INVALID_PAYLOAD" } }] },
        "mutation"
      ).ambiguousMutationResult
    ).toBe(false)
  })

  it("uses finite generic messaging for sign-in codes without sign-in evidence", () => {
    expect(
      classifyDirectusError({
        errors: [{ extensions: { code: "INVALID_CREDENTIALS" } }],
      }).category
    ).toBe("generic")
  })
})
