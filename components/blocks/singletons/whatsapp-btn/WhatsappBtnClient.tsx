"use client"

import { useEffect, useRef, useState } from "react"
import { WhatsAppIcon } from "@/assets/logos/social/whatsapp"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LinkButton } from "@/components/ui/button"
import type { WhatsappButtonQueryResult } from "@/services/domain/db/queries/singletons/whatsapp-button/whatsapp-button"
import { cn } from "cn"
import { Box } from "@/components/shared/content/Box"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"

const SHOW_MS = 12_000
const HIDE_MS = 180_000
const CYCLE_MS = SHOW_MS + HIDE_MS
const STORAGE_KEY = "whatsapp-cta"

export function WhatsappBtnClient({
  data,
  className,
}: {
  data: NonNullable<WhatsappButtonQueryResult>
  className: string
}) {
  const [scheduledOpen, setScheduledOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const startRef = useRef<number | null>(null)
  const open = hovered || focused || scheduledOpen
  const title = data.tooltip_title
  const message = data.tooltip_message
  const showBubble = Boolean(title || message)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = window.setTimeout(() => setScheduledOpen(true), 0)
      return () => window.clearTimeout(id)
    }

    if (startRef.current === null) {
      let start = Date.now()
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const stored = raw === null ? Number.NaN : Number(raw)
        if (Number.isFinite(stored)) start = stored
        else localStorage.setItem(STORAGE_KEY, String(start))
      } catch {
        // Storage blocked: this page load keeps `start` in memory only.
      }
      startRef.current = start
    }

    const start = startRef.current
    const into = (Date.now() - start) % CYCLE_MS
    const phaseOpen = into < SHOW_MS
    const delay = Math.max(phaseOpen ? SHOW_MS - into : CYCLE_MS - into, 1)
    const applyId = window.setTimeout(() => setScheduledOpen(phaseOpen), 0)
    const flipId = window.setTimeout(
      () => setEpoch((current) => (current === epoch ? current + 1 : current)),
      delay
    )
    return () => {
      window.clearTimeout(applyId)
      window.clearTimeout(flipId)
    }
  }, [epoch])

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {showBubble ? (
        <Alert
          role="status"
          aria-hidden={!open}
          className={cn(
            "absolute end-0 bottom-full mb-2 w-72",
            open
              ? "animate-in zoom-in-95 fade-in"
              : "pointer-events-none invisible"
          )}
        >
          <Box
            display="flex"
            align="center"
            justify="start"
            gap={0.5}
            orientation="horizontal"
          >
            <MaterialIcon name="info" size={16} />
            {title ? (
              <AlertTitle className="text-lg font-bold">{title}</AlertTitle>
            ) : null}
          </Box>
          {message ? (
            <AlertDescription>
              <SafeHtml content={message} unstyled className="text-sm" />
            </AlertDescription>
          ) : null}
        </Alert>
      ) : null}
      <LinkButton
        href={data.url}
        title={data.tooltip_title || "Chat en WhatsApp"}
        variant="secondary"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={title}
        className="size-16 rounded-full bg-green-500 hover:bg-green-600"
      >
        <WhatsAppIcon className="size-8" />
      </LinkButton>
    </div>
  )
}
