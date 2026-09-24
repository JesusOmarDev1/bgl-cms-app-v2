"use client"

import { useTranslations } from "next-intl"
import { useNetwork } from "@/hooks/useNetwork"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import {
  healthBadgeClassName,
  healthIconClassName,
} from "@/components/health/helpers"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function getSpeedLabel(downlink: number): {
  key: "speed.fast" | "speed.moderate" | "speed.slow"
  status: "operational" | "degraded" | "partial-outage"
} {
  if (downlink >= 10) {
    return { key: "speed.fast", status: "operational" }
  }
  if (downlink >= 2) {
    return { key: "speed.moderate", status: "degraded" }
  }
  return { key: "speed.slow", status: "partial-outage" }
}

export function NetworkStatus() {
  const t = useTranslations("network")
  const { online, downlink, rtt, saveData } = useNetwork()
  const speed = typeof downlink === "number" ? getSpeedLabel(downlink) : null
  const connectionStatus = online ? "operational" : "major-outage"

  return (
    <Card className="w-full max-w-xl" role="status">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <MaterialIcon name="wifi" size={24} />
          {t("title")}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex w-full flex-col items-stretch gap-2">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <span className="text-muted-foreground">{t("speed.label")}</span>
          <span className="flex items-center gap-2">
            <span className="tabular-nums">
              {typeof downlink === "number"
                ? t("speed.value", { mbps: downlink })
                : t("unknown")}
            </span>
            <Badge
              variant="outline"
              className={
                speed
                  ? healthBadgeClassName(speed.status)
                  : "text-muted-foreground"
              }
            >
              {speed ? t(speed.key) : t("unknown")}
            </Badge>
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <span className="text-muted-foreground">{t("latency.label")}</span>
          <span className="tabular-nums">
            {typeof rtt === "number"
              ? t("latency.value", { ms: rtt })
              : t("unknown")}
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <span className="text-muted-foreground">{t("saveData.label")}</span>
          <Badge
            variant="outline"
            className={
              saveData === true
                ? healthBadgeClassName("degraded")
                : "text-muted-foreground"
            }
          >
            {saveData === true
              ? t("saveData.on")
              : saveData === false
                ? t("saveData.off")
                : t("unknown")}
          </Badge>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <span className="text-muted-foreground">{t("statusLabel")}</span>
          <Badge
            variant="outline"
            className={healthBadgeClassName(connectionStatus)}
          >
            <MaterialIcon
              name={online ? "check_circle" : "cloud_off"}
              size={12}
              data-icon="inline-start"
              className={healthIconClassName(connectionStatus)}
            />
            {online ? t("status.online") : t("status.offline")}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  )
}
