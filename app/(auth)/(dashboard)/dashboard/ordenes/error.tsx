"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export default function OrdersError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("metrology.orders")
  return (
    <main className="min-h-[calc(100svh-3rem)] p-4 md:p-6">
      <section
        className="mx-auto max-w-7xl rounded-xl border border-border bg-card/30 p-6"
        role="alert"
      >
        <h1 className="text-xl font-semibold">{t("state.unexpected.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("state.unexpected.description")}
        </p>
        <Button className="mt-4" onPress={reset} variant="outline">
          {t("retry")}
        </Button>
      </section>
    </main>
  )
}
