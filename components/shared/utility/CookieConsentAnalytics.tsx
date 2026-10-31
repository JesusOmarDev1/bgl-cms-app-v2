"use client"

<<<<<<< HEAD
import { useCallback, useEffect, useState } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import {
  CookieConsent,
  readCookieConsent,
=======
import { useCallback, useEffect, useRef, useState } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import {
  CookieConsent,
  COOKIE_CONSENT_OPEN_EVENT,
  readCookieConsent,
  type CookieConsentHandle,
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
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
<<<<<<< HEAD
  const [consent, setConsent] = useState<CookieConsentValue | null>(null)
=======
  const consentRef = useRef<CookieConsentHandle>(null)
  const [consent, setConsent] = useState<CookieConsentValue | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const openPreferences = () => consentRef.current?.openPreferences()
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, openPreferences)
    return () =>
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, openPreferences)
  }, [])
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902

  useEffect(() => {
    const stored = readCookieConsent(STORAGE_KEY, CONSENT_VERSION)
    setAnalyticsDisabled(!stored?.value.analytics)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(stored?.value ?? null)
<<<<<<< HEAD
=======
    setLoaded(true)
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
  }, [])

  const handleChange = useCallback((value: CookieConsentValue | null) => {
    setAnalyticsDisabled(!value?.analytics)
    setConsent(value)
  }, [])

  return (
    <>
      <CookieConsent
<<<<<<< HEAD
=======
        ref={consentRef}
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
        storageKey={STORAGE_KEY}
        version={CONSENT_VERSION}
        showReopenButton={false}
        onChange={handleChange}
      />
<<<<<<< HEAD
      {consent?.analytics && GA_MEASUREMENT_ID ? (
=======
      {loaded && consent?.analytics && GA_MEASUREMENT_ID ? (
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      ) : null}
    </>
  )
}
