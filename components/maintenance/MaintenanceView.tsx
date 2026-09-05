"use client"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import { StatusIndicator } from "@/components/shared/debug/StatusIndicator"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BorderBeam } from "border-beam"

type MaintenanceViewProps = {
  title: string
  message: string
  statusLabel: string
  helperText: string
}

export function MaintenanceView({
  title,
  message,
  statusLabel,
  helperText,
}: MaintenanceViewProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center gap-4 p-6 pt-8">
      <BorderBeam className="w-full max-w-2xl">
        <Card role="status" aria-live="polite">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-7">
            <StatusIndicator
              className="w-fit"
              status="maintenance"
              label={statusLabel}
            />
          </CardContent>
          <CardFooter className="flex items-center gap-2 px-7">
            <MaterialIcon name="build" className="text-muted-foreground" />
            <p className="text-muted-foreground">{helperText}</p>
          </CardFooter>
        </Card>
      </BorderBeam>
    </main>
  )
}
