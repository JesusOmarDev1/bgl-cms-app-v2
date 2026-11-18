import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const harness = vi.hoisted(() => ({
  execute: vi.fn(),
  actions: [] as Array<{
    input: unknown
    resolve: (result: { data?: { ok: boolean; message?: string } }) => void
  }>,
  refresh: vi.fn(),
  routerRefresh: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: harness.routerRefresh }),
}))
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))
vi.mock("next-safe-action/hooks", async () => {
  const { useRef, useState } = await import("react")

  return {
    useAction: (
      _action: unknown,
      options: {
        onSuccess: (result: {
          data?: { ok: boolean; message?: string }
          input: unknown
        }) => void
      }
    ) => {
      const [data, setData] = useState<
        { ok: boolean; message?: string } | undefined
      >()
      const [isPending, setIsPending] = useState(false)
      const latestRequest = useRef(0)

      return {
        execute: (input: unknown) => {
          harness.execute(input)
          const requestId = ++latestRequest.current
          setIsPending(true)
          harness.actions.push({
            input,
            resolve: (result) => {
              if (requestId !== latestRequest.current) return
              setData(result.data)
              setIsPending(false)
              options.onSuccess({ data: result.data, input })
            },
          })
        },
        isPending,
        result: { data },
      }
    },
  }
})
vi.mock("@/services/domain/server/auth/profile", () => ({
  updateProfile: vi.fn(),
}))
vi.mock("@/services/domain/server/auth/refresh", () => ({
  refresh: harness.refresh,
}))
vi.mock("@/components/shared/auth/RefreshSession", () => ({
  RefreshSession: () => null,
}))
vi.mock("@/components/shared/forms/UploadAvatar", () => ({
  default: () => null,
}))
vi.mock("@/components/shared/assets/img/DirectusImage", () => ({
  DirectusImage: () => null,
}))
vi.mock("@/components/shared/assets/icons/MaterialIcon", () => ({
  MaterialIcon: () => null,
}))
vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) =>
    createElement("div", null, children),
  AvatarFallback: ({ children }: { children: React.ReactNode }) =>
    createElement("span", null, children),
}))
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    isDisabled,
    ...props
  }: React.ComponentProps<"button"> & { isDisabled?: boolean }) =>
    createElement("button", { ...props, disabled: isDisabled }, children),
}))
vi.mock("@/components/ui/field", () => ({
  FieldError: () => null,
}))
vi.mock("@/components/ui/input-group", () => ({
  InputGroup: ({ children }: { children: React.ReactNode }) =>
    createElement("div", null, children),
  InputGroupAddon: ({ children }: { children: React.ReactNode }) =>
    createElement("div", null, children),
  InputGroupInput: (props: React.ComponentProps<"input">) =>
    createElement("input", props),
}))
vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: React.ComponentProps<"textarea">) =>
    createElement("textarea", props),
}))

import { ProfileForm } from "@/components/shared/settings/ProfileForm"

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

const identity = {
  firstName: "Inicial",
  lastName: "Apellido",
  title: "Título",
  location: "Lugar",
  description: "Descripción",
  avatar: null,
}

describe("ProfileForm session refresh retry", () => {
  let container: HTMLDivElement
  let root: Root
  let unmounted: boolean

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    harness.execute.mockReset()
    harness.actions.length = 0
    harness.refresh.mockReset()
    harness.routerRefresh.mockReset()
    unmounted = false
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    if (!unmounted) act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  async function submitFirstName(value: string) {
    await act(async () => {
      const input = container.querySelector<HTMLInputElement>(
        'input[autocomplete="given-name"]'
      )!
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set?.call(input, value)
      input.dispatchEvent(new Event("input", { bubbles: true }))
      container.querySelector("form")!.requestSubmit()
      await Promise.resolve()
    })
  }

  async function resolveAction(
    index: number,
    result: { data?: { ok: boolean; message?: string } }
  ) {
    await act(async () => harness.actions[index].resolve(result))
  }

  it("preserves the ordinary successful save and route refresh", async () => {
    await act(async () => root.render(createElement(ProfileForm, { identity })))

    await submitFirstName("A")
    await resolveAction(0, { data: { ok: true } })

    expect(container.querySelector('[role="status"]')?.textContent).toBe(
      "settings.profileSaved"
    )
    expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(harness.routerRefresh).toHaveBeenCalledTimes(1)
    expect(harness.refresh).not.toHaveBeenCalled()
  })

  it.each([
    ["returned failure", { data: { ok: false, message: "unavailable" } }],
    ["missing result", { data: undefined }],
  ])("shows refresh %s without replaying", async (_label, result) => {
    harness.refresh.mockResolvedValue(result)
    await act(async () => root.render(createElement(ProfileForm, { identity })))

    await submitFirstName("A")
    await resolveAction(0, {
      data: { ok: false, message: "sessionExpired" },
    })
    await act(async () => Promise.resolve())

    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
      "unavailable"
    )
    expect(container.querySelector('[role="status"]')).toBeNull()
    expect(harness.execute).toHaveBeenCalledTimes(1)
    expect(harness.refresh).toHaveBeenCalledTimes(1)
  })

  it("shows a rejected refresh as unavailable without an unhandled rejection", async () => {
    harness.refresh.mockRejectedValue(new Error("refresh failed"))
    await act(async () => root.render(createElement(ProfileForm, { identity })))

    await submitFirstName("A")
    await resolveAction(0, {
      data: { ok: false, message: "sessionExpired" },
    })
    await act(async () => Promise.resolve())

    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
      "unavailable"
    )
    expect(container.querySelector('[role="status"]')).toBeNull()
    expect(harness.execute).toHaveBeenCalledTimes(1)
    expect(harness.refresh).toHaveBeenCalledTimes(1)
  })

  it.each(["original B response first", "replay response first"])(
    "keeps B accepted with %s and never retries twice",
    async (responseOrder) => {
      const rotation = deferred<{ data: { ok: boolean } }>()
      harness.refresh.mockReturnValue(rotation.promise)
      await act(async () =>
        root.render(createElement(ProfileForm, { identity }))
      )

      await submitFirstName("A")
      await resolveAction(0, {
        data: { ok: false, message: "sessionExpired" },
      })
      await submitFirstName("B")
      expect(harness.actions).toHaveLength(2)
      expect(harness.actions[1].input).toMatchObject({ firstName: "B" })

      await act(async () => {
        rotation.resolve({ data: { ok: true } })
        await rotation.promise
      })
      expect(harness.actions).toHaveLength(3)
      expect(harness.actions[2].input).toMatchObject({ firstName: "B" })

      if (responseOrder === "original B response first") {
        await resolveAction(1, {
          data: { ok: false, message: "sessionExpired" },
        })
        await resolveAction(2, { data: { ok: true } })
      } else {
        await resolveAction(2, { data: { ok: true } })
        await resolveAction(1, {
          data: { ok: false, message: "sessionExpired" },
        })
      }

      expect(container.querySelector('[role="status"]')?.textContent).toBe(
        "settings.profileSaved"
      )
      expect(container.querySelector('[role="alert"]')).toBeNull()
      expect(
        container.querySelector<HTMLInputElement>(
          'input[autocomplete="given-name"]'
        )?.value
      ).toBe("B")
      expect(harness.execute).toHaveBeenCalledTimes(3)
      expect(harness.refresh).toHaveBeenCalledTimes(1)
    }
  )

  it("keeps B saved and hides refresh failure when B succeeds first", async () => {
    const rotation = deferred<{ data: { ok: boolean; message?: string } }>()
    harness.refresh.mockReturnValue(rotation.promise)
    await act(async () => root.render(createElement(ProfileForm, { identity })))

    await submitFirstName("A")
    await resolveAction(0, {
      data: { ok: false, message: "sessionExpired" },
    })
    await submitFirstName("B")
    await resolveAction(1, { data: { ok: true } })

    await act(async () => {
      rotation.resolve({ data: { ok: false, message: "unavailable" } })
      await rotation.promise
    })

    expect(container.querySelector('[role="status"]')?.textContent).toBe(
      "settings.profileSaved"
    )
    expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(harness.actions).toHaveLength(2)
    expect(harness.actions[1].input).toMatchObject({ firstName: "B" })
    expect(harness.refresh).toHaveBeenCalledTimes(1)
  })

  it("does not replay after unmount while refresh is pending", async () => {
    const rotation = deferred<{ data: { ok: boolean } }>()
    harness.refresh.mockReturnValue(rotation.promise)
    await act(async () => root.render(createElement(ProfileForm, { identity })))

    await submitFirstName("A")
    await resolveAction(0, {
      data: { ok: false, message: "sessionExpired" },
    })
    expect(harness.actions).toHaveLength(1)

    act(() => {
      root.unmount()
      unmounted = true
    })
    await act(async () => {
      rotation.resolve({ data: { ok: true } })
      await rotation.promise
    })

    expect(harness.actions).toHaveLength(1)
    expect(harness.refresh).toHaveBeenCalledTimes(1)
  })
})
