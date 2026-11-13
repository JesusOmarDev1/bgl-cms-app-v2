import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import {
  getDirectusCode,
  getDirectusCodes,
  isTransportFailure,
} from "@/lib/directus/directus-error"
import type {
  DirectusError,
  DirectusErrorResponse,
} from "@/types/directus/errors"

const forbidden: DirectusError = {
  message: "You don't have permission to access this.",
  extensions: { code: "FORBIDDEN", status: 403 },
}

describe("getDirectusCodes", () => {
  it("reads the official code of an error thrown by the SDK", () => {
    const sdkError = {
      message: "Request failed",
      errors: [forbidden],
      response: { status: 403 },
    }

    expect(getDirectusCodes(sdkError)).toEqual(["FORBIDDEN"])
    expect(getDirectusCode(sdkError)).toBe("FORBIDDEN")
  })

  it("reads a raw DirectusErrorResponse body with one error", () => {
    const body: DirectusErrorResponse = { errors: [forbidden] }

    expect(getDirectusCodes(body)).toEqual(["FORBIDDEN"])
    expect(getDirectusCode(body)).toBe("FORBIDDEN")
  })

  it("reads every error of a multi-error body, first one first", () => {
    const body: DirectusErrorResponse = {
      errors: [
        forbidden,
        {
          message: "Invalid payload.",
          extensions: { code: "INVALID_PAYLOAD", field: "title" },
        },
        { message: "Token expired.", extensions: { code: "TOKEN_EXPIRED" } },
      ],
    }

    expect(getDirectusCodes(body)).toEqual([
      "FORBIDDEN",
      "INVALID_PAYLOAD",
      "TOKEN_EXPIRED",
    ])
    expect(getDirectusCode(body)).toBe("FORBIDDEN")
  })

  it("reads the ofetch wrapper body that nests errors under data", () => {
    expect(
      getDirectusCodes({
        response: { status: 403 },
        data: { errors: [forbidden] },
      })
    ).toEqual(["FORBIDDEN"])
  })

  it("skips entries without an official code and non-Directus failures", () => {
    expect(
      getDirectusCodes({
        errors: [
          null,
          { message: "malformed" },
          { message: "x", extensions: {} },
        ],
      })
    ).toEqual([])
    expect(getDirectusCodes(undefined)).toEqual([])
    expect(getDirectusCode(new Error("boom"))).toBeUndefined()
  })

  it("recognizes transport failures, which carry no Directus code", () => {
    const transport = new TypeError("fetch failed")

    expect(isTransportFailure(transport)).toBe(true)
    expect(getDirectusCode(transport)).toBeUndefined()
    expect(isTransportFailure({ errors: [forbidden] })).toBe(false)
  })
})
