import { act, createElement, createRef } from "react"
import type { ComponentProps, RefObject } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  COOKIE_CONSENT_OPEN_EVENT,
  CookieConsent,
  type CookieConsentHandle,
} from "@/components/shared/utility/CookieConsent"
import { CookieConsentAnalytics } from "@/components/shared/utility/CookieConsentAnalytics"

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => createElement("a", props),
}))

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const translations: Record<string, string> = {
      notice: "Aviso de cookies",
      customize: "Personalizar",
      accept: "Aceptar todo",
      reject: "Rechazar todo",
      save: "Guardar preferencias",
      title: "Preferencias de cookies",
      description: "Elige tus preferencias de cookies.",
      manage: "Gestionar cookies",
      alwaysOn: "Siempre activas",
      close: "Cerrar",
      "categories.necessary.label": "Necesarias",
      "categories.necessary.description": "Necesarias para el sitio.",
      "categories.preferences.label": "Preferencias",
      "categories.preferences.description": "Guardar preferencias.",
      "categories.analytics.label": "Analítica",
      "categories.analytics.description": "Medir visitas.",
      "categories.marketing.label": "Marketing",
      "categories.marketing.description": "Medir campañas.",
    }
    return Object.assign((key: string) => translations[key] ?? key, {
      has: (key: string) => key in translations,
    })
  },
}))

vi.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) =>
    createElement("div", {
      "data-testid": "google-analytics",
      "data-ga-id": gaId,
    }),
}))

vi.mock("@/lib/env/constants", () => ({ GA_MEASUREMENT_ID: "G-TEST" }))

const STORAGE_KEY = "bgl-cookie-consent"
const CONSENT_VERSION = "1"

function ConsentWithHandle({
  consentRef,
}: {
  consentRef: RefObject<CookieConsentHandle | null>
}) {
  return createElement(CookieConsent, {
    ref: consentRef,
    storageKey: STORAGE_KEY,
    version: CONSENT_VERSION,
    showReopenButton: false,
  })
}

describe("cookie consent and analytics gating", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    window.localStorage.clear()
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    window.localStorage.clear()
    vi.unstubAllGlobals()
  })

  it("keeps analytics disabled until saved consent allows it and handles footer preference events", async () => {
    await act(async () => root.render(createElement(CookieConsentAnalytics)))

    expect(
      container.querySelector('[data-testid="google-analytics"]')
    ).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()

    const customize = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Personalizar"
    )
    await act(async () => customize?.click())
    expect(document.querySelector("[aria-labelledby$='-title']")).not.toBeNull()
    expect(
      Array.from(
        container.querySelectorAll<HTMLInputElement>('input[role="switch"]')
      ).map((toggle) => toggle.checked)
    ).toEqual([false, false, false])
    expect(container.textContent).toContain("Siempre activas")

    const accept = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Aceptar todo"
    )
    expect(accept).toBeDefined()
    await act(async () => accept?.click())

    const stored = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "null"
    )
    expect(stored).toMatchObject({
      version: CONSENT_VERSION,
      value: {
        necessary: true,
        preferences: true,
        analytics: true,
        marketing: true,
      },
    })
    expect(stored.updatedAt).toEqual(expect.any(String))
    expect(
      container.querySelector('[data-testid="google-analytics"]')
    ).not.toBeNull()
    expect(
      (window as unknown as Record<string, boolean>)["ga-disable-G-TEST"]
    ).toBe(false)

    await act(async () => {
      window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT))
    })
    expect(document.querySelector('[aria-labelledby$="-title"]')).not.toBeNull()
  })

  it("keeps stored analytics refusals off and reset removes the saved choice", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_VERSION,
        updatedAt: "2026-01-01T00:00:00.000Z",
        value: {
          necessary: true,
          preferences: false,
          analytics: false,
          marketing: false,
        },
      })
    )
    await act(async () => root.render(createElement(CookieConsentAnalytics)))

    expect(
      container.querySelector('[data-testid="google-analytics"]')
    ).toBeNull()
    expect(
      (window as unknown as Record<string, boolean>)["ga-disable-G-TEST"]
    ).toBe(true)

    const consentRef = createRef<CookieConsentHandle>()
    await act(async () =>
      root.render(createElement(ConsentWithHandle, { consentRef }))
    )
    await act(async () => consentRef.current?.reset())

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it("ignores choices from an older consent version", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: "0",
        updatedAt: "2026-01-01T00:00:00.000Z",
        value: {
          necessary: true,
          preferences: true,
          analytics: true,
          marketing: true,
        },
      })
    )
    await act(async () => root.render(createElement(CookieConsentAnalytics)))

    expect(
      container.querySelector('[data-testid="google-analytics"]')
    ).toBeNull()
    expect(
      (window as unknown as Record<string, boolean>)["ga-disable-G-TEST"]
    ).toBe(true)
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
  })
})
