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
import {
  updateProfile,
  uploadAvatar,
} from "@/services/domain/server/auth/profile"

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
  vi.unstubAllGlobals()
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
      },
    })
  })

  it("maps location and description into the update payload", async () => {
    givenSession()
    requestMock.mockResolvedValue({})

    await expect(
      updateProfile({
        firstName: "Ana",
        lastName: "",
        title: "",
        location: "  Bogotá  ",
        description: " Técnica de laboratorio ",
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

describe("upload-avatar server action", () => {
  function givenFetchUpload() {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
  }

  function givenFile(overrides: Partial<{ size: number; type: string }> = {}) {
    const file = new File(["x"], "photo.png", { type: "image/png" })
    if (overrides.size !== undefined) {
      Object.defineProperty(file, "size", { value: overrides.size })
    }
    if (overrides.type !== undefined) {
      Object.defineProperty(file, "type", { value: overrides.type })
    }
    return file
  }

  it("uploads the file to Directus and patches the own user avatar", async () => {
    givenSession()
    const fetchMock = givenFetchUpload()
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { id: "file-9" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    )
    requestMock.mockResolvedValue({})

    await expect(uploadAvatar({ photo: givenFile() })).resolves.toEqual({
      data: { ok: true },
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain("/files")
    expect(new Headers(init.headers).get("Authorization")).toBe(
      "Bearer access-1"
    )
    expect(init.body).toBeInstanceOf(FormData)
    expect((init.body as FormData).get("file")).toBeInstanceOf(File)
    expect(requestMock).toHaveBeenCalledTimes(1)
    expect(requestMock.mock.calls[0][0]).toEqual({
      __command: "updateMe",
      data: { avatar: "file-9" },
    })
  })

  it("rejects a photo over 2 MB with photoTooLarge and zero requests", async () => {
    givenSession()
    const fetchMock = givenFetchUpload()

    const result = await uploadAvatar({
      photo: givenFile({ size: 2 * 1024 * 1024 + 1 }),
    })

    expect((result.data as ProfileResult).message).toBe("photoTooLarge")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(createPrivateDirectus).not.toHaveBeenCalled()
    expect(requestMock).not.toHaveBeenCalled()
  })

  it("rejects a non-image photo with photoInvalidType and zero requests", async () => {
    givenSession()
    const fetchMock = givenFetchUpload()

    const result = await uploadAvatar({
      photo: givenFile({ type: "application/pdf" }),
    })

    expect((result.data as ProfileResult).message).toBe("photoInvalidType")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(createPrivateDirectus).not.toHaveBeenCalled()
    expect(requestMock).not.toHaveBeenCalled()
  })

  it("fails closed with sessionExpired and zero requests without a session", async () => {
    givenNoSession()
    const fetchMock = givenFetchUpload()

    const result = await uploadAvatar({ photo: givenFile() })

    expect((result.data as ProfileResult).message).toBe("sessionExpired")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(createPrivateDirectus).not.toHaveBeenCalled()
    expect(requestMock).not.toHaveBeenCalled()
  })

  it("maps a Directus access denial on the avatar patch to accessDenied", async () => {
    givenSession()
    const fetchMock = givenFetchUpload()
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { id: "file-9" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    )
    requestMock.mockRejectedValue({
      response: { status: 403 },
      errors: [{ message: "redacted", extensions: { code: "FORBIDDEN" } }],
    })

    const result = await uploadAvatar({ photo: givenFile() })

    expect((result.data as ProfileResult).message).toBe("accessDenied")
  })
})
