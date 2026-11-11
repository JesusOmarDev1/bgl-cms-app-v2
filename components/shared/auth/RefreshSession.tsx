"use client"

import { useEffect, useRef, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { refresh } from "@/services/domain/server/auth/refresh"
import { Button } from "@/components/ui/button"

export function RefreshSession() {
  const router = useRouter()
  const started = useRef(false)
  const [failed, setFailed] = useState(false)
  const t = useTranslations("directusErrors")
  const authT = useTranslations("auth")
  const action = useAction(refresh, {
    onSuccess: ({ data }) => {
      if (data?.ok || data?.message === "sessionExpired") router.refresh()
      else setFailed(true)
    },
    onError: () => setFailed(true),
  })

  useEffect(() => {
    if (started.current) return
    started.current = true
    action.execute({})
  }, [action.execute])

  if (!failed) return null
  return (
    <div role="alert" className="flex flex-col items-center gap-4 text-center">
      <p>{t("unavailable")}</p>
      <Button
        variant="secondary"
        onClick={() => {
          setFailed(false)
          action.execute({})
        }}
      >
        {authT("retry")}
      </Button>
    </div>
  )
}
