"use client"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; cause?: unknown }
  reset: () => void
}) {
  return (
    <div
      data-theme-scope="dark"
      className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground"
    >
      <h1 className="text-6xl font-bold">Algo salió mal</h1>
      <p className="text-2xl text-muted-foreground">
        Por favor, intenta de nuevo mas tarde. Si el problema persiste, contacta
        al soporte técnico.
      </p>
      {process.env.NODE_ENV === "development" && (
        <code className="text-sm text-muted-foreground">{error.message}</code>
      )}
      <Button onClick={() => reset()}>Intentar de nuevo</Button>
    </div>
  )
}
