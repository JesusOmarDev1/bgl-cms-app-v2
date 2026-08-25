"use client"

import useShare from "@/hooks/useShare"
import showToast from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface ShareProps {
  title?: string
  text?: string
  url?: string
  size?: "default" | "sm" | "lg"
  variant?:
    | "default"
    | "secondary"
    | "ghost"
    | "outline"
    | "link"
    | "destructive"
    | null
  successMessage?: string
  errorMessage?: string
  className?: string
  disabled?: boolean
}

export default function Share({
  title = "Compartir",
  text = "¡Mira esto!",
  url: urlProp,
  className,
  disabled,
  successMessage,
  errorMessage,
  size = "default",
  variant = "default",
}: ShareProps) {
  const t = useTranslations("share")
  const share = useShare({
    onSuccess: () =>
      showToast({
        title: successMessage || t("share_success"),
        message: successMessage || t("share_success"),
        variant: "success",
        icon: <MaterialIcon name="share" className="text-success" />,
      }),
    onError: (error) =>
      showToast({
        title: errorMessage || t("share_error"),
        message: error instanceof Error ? error.message : t("share_error"),
        variant: "error",
        icon: <MaterialIcon name="share" className="text-error" />,
      }),
    fallbackCopy: true,
  })

  const handleShare = async () => {
    if (!disabled) {
      await share.share({
        title,
        text,
        url: urlProp ?? window.location.href,
      })
    }
  }

  return (
    <Button
      className={cn(className, "cursor-pointer")}
      size={size}
      onClick={handleShare}
      aria-label={title}
      isDisabled={disabled}
      variant={variant}
    >
      <MaterialIcon name="share" />
      {t("share")}
    </Button>
  )
}
