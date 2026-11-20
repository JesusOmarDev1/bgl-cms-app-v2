import { Skeleton } from "@/components/ui/skeleton"
import { getTranslations } from "next-intl/server"

export default async function Loading() {
  const t = await getTranslations("metrology.orders")
  return (
    <main
      className="min-h-[calc(100svh-3rem)] flex-1 p-4 md:p-6"
      aria-busy="true"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p role="status" className="sr-only">
          {t("loading")}
        </p>
        <div
          className="flex gap-2 overflow-hidden border-b border-border pb-2"
          aria-hidden="true"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-24 shrink-0" />
          ))}
        </div>
        <div
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)_auto]"
          aria-hidden="true"
        >
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div
          className="hidden overflow-hidden rounded-xl border border-border md:block"
          aria-hidden="true"
        >
          <div className="grid grid-cols-6 gap-4 border-b border-border p-4">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="grid grid-cols-6 gap-4 border-b border-border p-4 last:border-0"
            >
              {Array.from({ length: 6 }, (_, cell) => (
                <Skeleton key={cell} className="h-5 w-full" />
              ))}
            </div>
          ))}
        </div>
        <div className="grid gap-3 md:hidden" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-3 rounded-xl border border-border p-4"
            >
              {Array.from({ length: 4 }, (_, cell) => (
                <Skeleton key={cell} className="h-5 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
