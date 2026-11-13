import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}))
vi.mock("@directus/sdk", () => ({
  updateMe: vi.fn((data: unknown) => ({ __command: "updateMe", data })),
  uploadFiles: vi.fn((data: FormData) => ({ __command: "uploadFiles", data })),
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

  function givenDirectusFailure(
    code: string,
    extensions: Record<string, unknown> = {}
  ) {
    requestMock.mockRejectedValue({
      message: "redacted",
      errors: [{ message: "redacted", extensions: { code, ...extensions } }],
      response: { status: 400 },
    })
  }

  it.each([
    ["TOKEN_EXPIRED", "sessionExpired"],
    ["INVALID_TOKEN", "sessionExpired"],
    ["USER_SUSPENDED", "sessionExpired"],
    ["INVALID_IP", "sessionExpired"],
    ["FORBIDDEN", "accessDenied"],
    ["FAILED_VALIDATION", "validationFailed"],
    ["CONTENT_TOO_LARGE", "photoTooLarge"],
    ["SERVICE_UNAVAILABLE", "unavailable"],
    ["CODE_INVENTADO", "generic"],
  ])("maps the official %s code to %s", async (code, expected) => {
    givenSession()
    givenDirectusFailure(code, { field: "title" })

    const result = await updateProfile({ firstName: "Ana" })

    expect((result.data as ProfileResult).message).toBe(expected)
  })

  it("reports a transport failure as unavailable, not as a Directus verdict", async () => {
    givenSession()
    requestMock.mockRejectedValue(new TypeError("fetch failed"))

    const result = await updateProfile({ firstName: "Ana" })

    expect((result.data as ProfileResult).message).toBe("unavailable")
  })

  it.each([
    ["an error without a Directus code", new Error("boom")],
    [
      "the client timeout",
      Object.assign(new Error("This operation was aborted"), {
        name: "AbortError",
      }),
    ],
  ])(
    "reports %s as unavailable, not as a Directus verdict",
    async (_label, error) => {
      givenSession()
      requestMock.mockRejectedValue(error)

      const result = await updateProfile({ firstName: "Ana" })

      expect((result.data as ProfileResult).message).toBe("unavailable")
    }
  )

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

  function givenNoRawFetch() {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
  }

  it("uploads the file with the SDK and patches the avatar with the id it returns", async () => {
    givenSession()
    const fetchMock = givenNoRawFetch()
    requestMock
      .mockResolvedValueOnce({ id: "file-9" })
      .mockResolvedValueOnce({})

    await expect(uploadAvatar({ photo: givenFile() })).resolves.toEqual({
      data: { ok: true },
    })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(createPrivateDirectus).toHaveBeenCalledTimes(1)
    expect(createPrivateDirectus).toHaveBeenCalledWith("access-1")
    expect(requestMock).toHaveBeenCalledTimes(2)
    const upload = requestMock.mock.calls[0][0] as {
      __command: string
      data: FormData
    }
    expect(upload.__command).toBe("uploadFiles")
    expect(upload.data).toBeInstanceOf(FormData)
    expect(upload.data.get("file")).toBeInstanceOf(File)
    expect(requestMock.mock.calls[1][0]).toEqual({
      __command: "updateMe",
      data: { avatar: "file-9" },
    })
  })

  it.each(["image/jpeg", "image/png", "image/webp"])(
    "accepts a %s photo",
    async (type) => {
      givenSession()
      requestMock
        .mockResolvedValueOnce({ id: "file-9" })
        .mockResolvedValueOnce({})

      await expect(
        uploadAvatar({ photo: givenFile({ type }) })
      ).resolves.toEqual({ data: { ok: true } })
      expect(requestMock).toHaveBeenCalledTimes(2)
    }
  )

  it.each(["image/gif", "application/pdf"])(
    "rejects a %s photo with photoInvalidType and zero requests",
    async (type) => {
      givenSession()
      const fetchMock = givenNoRawFetch()

      const result = await uploadAvatar({ photo: givenFile({ type }) })

      expect((result.data as ProfileResult).message).toBe("photoInvalidType")
      expect(fetchMock).not.toHaveBeenCalled()
      expect(createPrivateDirectus).not.toHaveBeenCalled()
      expect(requestMock).not.toHaveBeenCalled()
    }
  )

  it("rejects a photo over 2 MB with photoTooLarge and zero requests", async () => {
    givenSession()
    const fetchMock = givenNoRawFetch()

    const result = await uploadAvatar({
      photo: givenFile({ size: 2 * 1024 * 1024 + 1 }),
    })

    expect((result.data as ProfileResult).message).toBe("photoTooLarge")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(createPrivateDirectus).not.toHaveBeenCalled()
    expect(requestMock).not.toHaveBeenCalled()
  })

  it("fails closed with sessionExpired and zero requests without a session", async () => {
    givenNoSession()
    const fetchMock = givenNoRawFetch()

    const result = await uploadAvatar({ photo: givenFile() })

    expect((result.data as ProfileResult).message).toBe("sessionExpired")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(createPrivateDirectus).not.toHaveBeenCalled()
    expect(requestMock).not.toHaveBeenCalled()
  })

  it("maps a Directus access denial on the avatar patch to accessDenied", async () => {
    givenSession()
    givenNoRawFetch()
    requestMock.mockResolvedValueOnce({ id: "file-9" }).mockRejectedValueOnce({
      response: { status: 403 },
      errors: [{ message: "redacted", extensions: { code: "FORBIDDEN" } }],
    })

    const result = await uploadAvatar({ photo: givenFile() })

    expect((result.data as ProfileResult).message).toBe("accessDenied")
  })

  it("reports unavailable when the SDK upload fails", async () => {
    givenSession()
    givenNoRawFetch()
    requestMock.mockRejectedValue({
      errors: [
        { message: "redacted", extensions: { code: "SERVICE_UNAVAILABLE" } },
      ],
    })

    const result = await uploadAvatar({ photo: givenFile() })

    expect((result.data as ProfileResult).message).toBe("unavailable")
    expect(requestMock).toHaveBeenCalledTimes(1)
  })
})
