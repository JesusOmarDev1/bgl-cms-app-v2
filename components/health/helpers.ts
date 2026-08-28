import { HealthStatusType } from "@/types/enums/health-status"

export const STATUS_UI: Record<
  HealthStatusType,
  { icon: string; variant: "default" | "secondary" | "destructive" }
> = {
  ok: { icon: "check_circle", variant: "default" },
  warn: { icon: "warning", variant: "secondary" },
  error: { icon: "error", variant: "destructive" },
  unreachable: { icon: "cloud_off", variant: "destructive" },
}
