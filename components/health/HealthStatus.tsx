"use server"
import { getTranslations } from "next-intl/server"
import { getHealthRepository } from "@/services/domain/db/repositories/endpoints/health"
import { getSiteSettingsRepository } from "@/services/domain/db/repositories/singletons/site-settings"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HealthStatusIndicator } from "./HealthStatusIndicator"
import {
  HEALTH_RESPONSE_TIME_CRITICAL_MS,
  HEALTH_RESPONSE_TIME_DEGRADED_MS,
  resolveHealthIndicatorHint,
  resolveHealthIndicatorStatus,
} from "./helpers"
import { HealthStatusChart } from "./HealthStatusChart"

const HEALTH_CHART_STATUS_ORDER = [
  "ok",
  "warn",
  "error",
  "unreachable",
] as const

function buildHealthChartData(value: number) {
  return HEALTH_CHART_STATUS_ORDER.map((status) => ({
    status,
    value,
  }))
}

export async function HealthStatus() {
  const [t, health, siteSettings] = await Promise.all([
    getTranslations("health"),
    getHealthRepository(),
    getSiteSettingsRepository(),
  ])
  const maintenanceInProgress = siteSettings.maintenance_mode
  const resolvedStatus = resolveHealthIndicatorStatus({
    status: health.status,
    responseTime: health.responseTime,
    ping: health.ping,
    maintenanceInProgress,
  })
  const hint = resolveHealthIndicatorHint({
    status: health.status,
    responseTime: health.responseTime,
    ping: health.ping,
    maintenanceInProgress,
  })
  const hintMessage =
    hint === "maintenance"
      ? t("hint.maintenance")
      : hint === "critical-latency"
        ? t("hint.critical-latency", {
            ms: HEALTH_RESPONSE_TIME_CRITICAL_MS,
          })
        : hint === "degraded-latency"
          ? t("hint.degraded-latency", {
              ms: HEALTH_RESPONSE_TIME_DEGRADED_MS,
            })
          : null
  const ms = Math.round(health.responseTime)
  const chartData = buildHealthChartData(ms)

  return (
    <Card className="w-full max-w-sm" role="status">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <MaterialIcon name="bigtop_updates" size={24} />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        <HealthStatusChart data={chartData} />
        <HealthStatusIndicator
          status={health.status}
          responseTime={health.responseTime}
          ping={health.ping}
          maintenanceInProgress={maintenanceInProgress}
          size="lg"
          label={t(`indicator.${resolvedStatus}`)}
        />
        <span className="text-muted-foreground tabular-nums">
          {t("ping")} {t("responseTime", { ms })}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("statusLabel")} {t(`status.${health.status}`)}
        </span>
        {hintMessage ? (
          <span className="text-center text-xs text-amber-400">
            {hintMessage}
          </span>
        ) : null}
      </CardContent>
    </Card>
  )
}
