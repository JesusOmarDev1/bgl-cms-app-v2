"use client"

import { useEffect, useRef } from "react"
import { Box } from "@/components/shared/content/Box"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function FormState({ message }: { message: string }) {
  const statusRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    statusRef.current?.focus()
  }, [])

  return (
    <Box
      display="flex"
      align="center"
      justify="center"
      className="-mt-24 h-dvh w-full"
      padding={4}
    >
      <Card>
        <CardContent className="flex flex-col items-center gap-4">
          <MaterialIcon
            name="check_circle"
            className="t-success-check text-foreground"
            data-state="in"
            size={64}
          />
          <CardTitle
            role="status"
            tabIndex={-1}
            ref={statusRef}
            className="text-2xl font-bold"
          >
            {message}
          </CardTitle>
        </CardContent>
        <CardFooter className="flex items-center justify-center">
          <Button onClick={() => window.location.reload()}>
            <MaterialIcon className="text-accent" name="refresh" />
            Recargar la página
          </Button>
        </CardFooter>
      </Card>
    </Box>
  )
}
