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
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">Algo salió mal</h1>
      <p className="text-2xl text-muted-foreground">
        Por favor, intenta de nuevo.
      </p>
      <Button onClick={() => reset()}>Intentar de nuevo</Button>
    </div>
  )
}
