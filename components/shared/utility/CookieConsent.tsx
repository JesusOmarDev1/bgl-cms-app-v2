"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

export default function CookieConsentBlock() {
  const [visible, setVisible] = React.useState(true)

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies to improve your experience and analyze traffic. Read
          our{" "}
          <a
            href="#"
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            cookie policy
          </a>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setVisible(false)}
            className="flex-1 sm:flex-none"
          >
            Decline
          </Button>
          <Button
            onClick={() => setVisible(false)}
            className="flex-1 sm:flex-none"
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  )
}
