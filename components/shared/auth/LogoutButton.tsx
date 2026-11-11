"use client"

import { useAction } from "next-safe-action/hooks"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout } from "@/services/domain/server/auth/logout"

export function LogoutButton() {
  const t = useTranslations("auth")
  const router = useRouter()
  const action = useAction(logout, {
    onSuccess: ({ data }) => {
      if (data?.ok || data?.message === "sessionExpired") {
        router.replace("/login")
        router.refresh()
      }
    },
  })

  const signOut = () => {
    action.execute({})
  }

  if (action.isPending) {
    return (
      <Button variant="outline" isDisabled>
        {t("signingOut")}
      </Button>
    )
  }

  return (
    <Button variant="outline" onPress={signOut} isDisabled={action.isPending}>
      {t("signOut")}
    </Button>
  )
}
