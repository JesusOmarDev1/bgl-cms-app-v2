"use server"
import { getTranslations } from "next-intl/server"
import { getHealthRepository } from "@/services/domain/db/repositories/endpoints/health"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import {
  Card,
  CardFooter,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  HEALTH_RESPONSE_TIME_CRITICAL_MS,
  HEALTH_RESPONSE_TIME_DEGRADED_MS,
  healthBadgeClassName,
  healthIconClassName,
  healthPingClassName,
  resolveHealthView,
} from "./helpers"

export async function HealthStatus() {
  const t = await getTranslations("health")
  const health = await getHealthRepository()
  const view = resolveHealthView({
    status: health.status,
    responseTime: health.responseTime,
    ping: health.ping,
  })

  const hintText =
    view.hint === "critical-latency"
      ? t("hint.critical-latency", { ms: HEALTH_RESPONSE_TIME_CRITICAL_MS })
      : view.hint === "degraded-latency"
        ? t("hint.degraded-latency", { ms: HEALTH_RESPONSE_TIME_DEGRADED_MS })
        : view.hint === "maintenance"
          ? t("hint.maintenance")
          : null

  return (
    <Card className="w-full max-w-xl" role="status">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <MaterialIcon name="bigtop_updates" size={24} />
          {t("title")}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2">
        <span className={healthPingClassName(view.latency)}>
          {t("ping")} {Math.round(health.responseTime)} ms
        </span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{t("statusLabel")}</span>
          <Badge
            variant="outline"
            className={healthBadgeClassName(view.indicatorStatus)}
          >
            <MaterialIcon
              name={view.icon}
              size={12}
              data-icon="inline-start"
              className={healthIconClassName(view.indicatorStatus)}
            />
            {t(`status.${health.status}`)}
          </Badge>
        </div>
        {hintText ? (
          <p className="basis-full text-sm text-muted-foreground">{hintText}</p>
        ) : null}
      </CardFooter>
    </Card>
  )
}
