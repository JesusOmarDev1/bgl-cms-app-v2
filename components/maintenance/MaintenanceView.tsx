import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import { StatusIndicator } from "@/components/shared/debug/StatusIndicator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-xl" role="status" aria-live="polite">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MaterialIcon name="construction" size={22} />
            {title}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <StatusIndicator status="maintenance" size="lg" label={statusLabel} />
          <p className="text-xs text-muted-foreground">{helperText}</p>
        </CardContent>
      </Card>
    </main>
  )
}
