import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}))
vi.mock("@directus/sdk", () => ({
  isDirectusError: vi.fn(
    (error: unknown) =>
      typeof error === "object" &&
      error !== null &&
      Array.isArray((error as { errors?: unknown[] }).errors)
  ),
  updateMe: vi.fn((data: unknown) => ({ __command: "updateMe", data })),
}))
vi.mock("@/config/directus-private", () => ({
  createPrivateDirectus: vi.fn(),
}))

import { cookies } from "next/headers"
import { createPrivateDirectus } from "@/config/directus-private"
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
} from "@/services/domain/server/auth/token"
import { updateProfile } from "@/services/domain/server/auth/profile"

const store = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

const requestMock = vi.fn()
const setTokenMock = vi.fn()

type ProfileResult = { ok: false; message: string }

afterEach(() => {
  vi.clearAllMocks()
})

function givenSession() {
  vi.mocked(cookies).mockResolvedValue(store as never)
  store.get.mockImplementation((name: string) => {
    if (name === AUTH_REFRESH_COOKIE) return { value: "refresh-1" }
    if (name === AUTH_ACCESS_COOKIE) return { value: "access-1" }
    return undefined
  })
  vi.mocked(createPrivateDirectus).mockResolvedValue({
    setToken: setTokenMock,
    request: requestMock,
  } as never)
}

function givenNoSession() {
  vi.mocked(cookies).mockResolvedValue(store as never)
  store.get.mockReturnValue(undefined)
}

describe("update-profile server action", () => {
  it("updates the own user through the private client and maps only provided fields", async () => {
    givenSession()
    requestMock.mockResolvedValue({})

    await expect(
      updateProfile({
        firstName: "  Ana  ",
        lastName: "García",
        title: "Técnica",
      })
    ).resolves.toEqual({ data: { ok: true } })

    expect(createPrivateDirectus).toHaveBeenCalledWith("access-1")
    expect(requestMock).toHaveBeenCalledTimes(1)
    expect(requestMock.mock.calls[0][0]).toEqual({
      __command: "updateMe",
      data: {
        first_name: "Ana",
        last_name: "García",
        title: "Técnica",
        location: "",
        description: "",
        tags: [],
      },
    })
  })

  it("sends empty strings to clear cleared fields instead of skipping them", async () => {
    givenSession()
    requestMock.mockResolvedValue({})

    await expect(
      updateProfile({ firstName: "", lastName: "  ", title: undefined })
    ).resolves.toEqual({ data: { ok: true } })

    expect(requestMock.mock.calls[0][0]).toEqual({
      __command: "updateMe",
      data: {
        first_name: "",
        last_name: "",
        title: "",
        location: "",
        description: "",
        tags: [],
      },
    })
  })

  it("maps location, description and cleaned tags into the update payload", async () => {
    givenSession()
    requestMock.mockResolvedValue({})

    await expect(
      updateProfile({
        firstName: "Ana",
        lastName: "",
        title: "",
        location: "  Bogotá  ",
        description: " Técnica de laboratorio ",
        tags: "básculas, calibración, , básculas,   ",
      })
    ).resolves.toEqual({ data: { ok: true } })

    expect(requestMock.mock.calls[0][0]).toEqual({
      __command: "updateMe",
      data: {
        first_name: "Ana",
        last_name: "",
        title: "",
        location: "Bogotá",
        description: "Técnica de laboratorio",
        tags: ["básculas", "calibración"],
      },
    })
  })

  it("sends an empty tags array and empty strings to clear the fields", async () => {
    givenSession()
    requestMock.mockResolvedValue({})

    await expect(updateProfile({ tags: "  ,  " })).resolves.toEqual({
      data: { ok: true },
    })

    expect(requestMock.mock.calls[0][0]).toEqual({
      __command: "updateMe",
      data: {
        first_name: "",
        last_name: "",
        title: "",
        location: "",
        description: "",
        tags: [],
      },
    })
  })

  it("fails closed with a stable session key and zero client calls without a session", async () => {
    givenNoSession()

    const result = await updateProfile({
      firstName: "Ana",
    } as never)
    expect((result.data as ProfileResult).message).toBe("sessionExpired")
    expect(createPrivateDirectus).not.toHaveBeenCalled()
    expect(setTokenMock).not.toHaveBeenCalled()
    expect(requestMock).not.toHaveBeenCalled()
  })

  it("rejects more than 20 tags with validationFailed and zero client calls", async () => {
    givenSession()

    const result = await updateProfile({
      tags: Array.from({ length: 21 }, (_, index) => `tag${index}`).join(","),
    })

    expect((result.data as ProfileResult).message).toBe("validationFailed")
    expect(createPrivateDirectus).not.toHaveBeenCalled()
    expect(requestMock).not.toHaveBeenCalled()
  })

  it("rejects a single tag over 50 characters with validationFailed and zero client calls", async () => {
    givenSession()

    const result = await updateProfile({
      tags: `ok,${"x".repeat(51)}`,
    })

    expect((result.data as ProfileResult).message).toBe("validationFailed")
    expect(createPrivateDirectus).not.toHaveBeenCalled()
    expect(requestMock).not.toHaveBeenCalled()
  })

  it("classifies a Directus access denial as a stable error key", async () => {
    givenSession()
    requestMock.mockRejectedValue({
      response: { status: 403 },
      errors: [{ message: "redacted", extensions: { code: "FORBIDDEN" } }],
    })

    const result = await updateProfile({
      firstName: "Ana",
      lastName: "García",
      title: "",
    })

    expect((result.data as ProfileResult).message).toBe("accessDenied")
  })

  it("rejects names over 80 characters before touching Directus", async () => {
    givenSession()

    const result = await updateProfile({
      firstName: "a".repeat(81),
      lastName: "",
      title: "",
    })

    expect(result.validationErrors).toBeTruthy()
    expect(requestMock).not.toHaveBeenCalled()
  })
})
