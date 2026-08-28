"use server"
import { getTranslations } from "next-intl/server"
import { getHealthRepository } from "@/services/domain/db/repositories/endpoints/health"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { HealthStatusType } from "@/types/enums/health-status"
import { HealthStatusSkeleton } from "./HealthStatusSkeleton"
import { STATUS_UI } from "./helpers"
import { HealthStatusChart } from "./HealthStatusChart"

export async function HealthStatus() {
  const t = await getTranslations("health")
  const health = await getHealthRepository()
  const ui = STATUS_UI[health.status as HealthStatusType]
  const ms = Math.round(health.responseTime)

  if (health.status === "unreachable") {
    return <HealthStatusSkeleton />
  }

  return (
    <Card className="w-full max-w-sm" role="status">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MaterialIcon name="bigtop_updates" size={24} />
          <span className="text-xl font-bold">{t("title")}</span>
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        <HealthStatusChart
          data={[
            {
              status: "ok",
              value: ms,
            },
            {
              status: "warn",
              value: ms,
            },
            {
              status: "error",
              value: ms,
            },
            {
              status: "unreachable",
              value: ms,
            },
          ]}
        />
        <Badge variant={ui.variant}>
          <MaterialIcon name={ui.icon} size={12} data-icon="inline-start" />
          {t(`status.${health.status}`)}
        </Badge>
        <span className="text-muted-foreground tabular-nums">
          {t("ping")} {t("responseTime", { ms })}
        </span>
      </CardContent>
    </Card>
  )
}
