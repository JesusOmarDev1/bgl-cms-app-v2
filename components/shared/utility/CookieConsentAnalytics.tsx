"use client"

import { useCallback, useEffect, useState } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import {
  CookieConsent,
  readCookieConsent,
  type CookieConsentValue,
} from "@/components/shared/utility/CookieConsent"
import { GA_MEASUREMENT_ID } from "@/lib/env/constants"

const STORAGE_KEY = "bgl-cookie-consent"
const CONSENT_VERSION = "1"

function setAnalyticsDisabled(disabled: boolean) {
  if (!GA_MEASUREMENT_ID) return
  ;(window as unknown as Record<string, boolean>)[
    `ga-disable-${GA_MEASUREMENT_ID}`
  ] = disabled
}

export function CookieConsentAnalytics() {
  const [consent, setConsent] = useState<CookieConsentValue | null>(null)

  useEffect(() => {
    const stored = readCookieConsent(STORAGE_KEY, CONSENT_VERSION)
    setAnalyticsDisabled(!stored?.value.analytics)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(stored?.value ?? null)
  }, [])

  const handleChange = useCallback((value: CookieConsentValue | null) => {
    setAnalyticsDisabled(!value?.analytics)
    setConsent(value)
  }, [])

  return (
    <>
      <CookieConsent
        storageKey={STORAGE_KEY}
        version={CONSENT_VERSION}
        showReopenButton={false}
        onChange={handleChange}
      />
      {consent?.analytics && GA_MEASUREMENT_ID ? (
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      ) : null}
    </>
  )
}
