"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import {
  CookieConsent,
  COOKIE_CONSENT_OPEN_EVENT,
  readCookieConsent,
  type CookieConsentHandle,
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
  const consentRef = useRef<CookieConsentHandle>(null)
  const [consent, setConsent] = useState<CookieConsentValue | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const openPreferences = () => consentRef.current?.openPreferences()
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, openPreferences)
    return () =>
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, openPreferences)
  }, [])

  useEffect(() => {
    const stored = readCookieConsent(STORAGE_KEY, CONSENT_VERSION)
    setAnalyticsDisabled(!stored?.value.analytics)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(stored?.value ?? null)
    setLoaded(true)
  }, [])

  const handleChange = useCallback((value: CookieConsentValue | null) => {
    setAnalyticsDisabled(!value?.analytics)
    setConsent(value)
  }, [])

  return (
    <>
      <CookieConsent
        ref={consentRef}
        storageKey={STORAGE_KEY}
        version={CONSENT_VERSION}
        showReopenButton={false}
        onChange={handleChange}
      />
      {loaded && consent?.analytics && GA_MEASUREMENT_ID ? (
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      ) : null}
    </>
  )
}
