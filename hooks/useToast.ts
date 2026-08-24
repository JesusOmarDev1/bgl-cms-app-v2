import { ToastVariantType } from "@/types/enums/toast-variant"
import { toast } from "sonner"

interface ToastOptions {
  title: string
  message: string
  variant: ToastVariantType
  action?: {
    label: string
    onClick: () => void
  } | null
  icon?: React.ReactNode
  duration?: number
}

export default function showToast(options: ToastOptions): void {
  const { title, message, variant, action, icon, duration = 3000 } = options

  switch (variant) {
    case "error":
      toast.error(title, {
        description: message,
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
        icon: icon,
        duration: duration,
      })
    case "success":
      toast.success(title, {
        description: message,
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
        icon: icon,
        duration: duration,
      })
    case "warning":
      toast.warning(title, {
        description: message,
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
        icon: icon,
        duration: duration,
      })
    case "info":
      toast.info(title, {
        description: message,
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
        icon: icon,
        duration: duration,
      })
  }
}
