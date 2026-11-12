import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { connection } from "next/server"
import { readAuthSession } from "@/services/domain/server/auth/token"

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
}

async function DashboardGuard() {
  await connection()
  if (!(await readAuthSession())) redirect("/login")
  return null
}

export default function DashboardPage() {
  return (
    <main className="min-h-[calc(100svh-3rem)] flex-1">
      <Suspense fallback={null}>
        <DashboardGuard />
      </Suspense>
    </main>
  )
}
