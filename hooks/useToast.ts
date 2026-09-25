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

const toastByVariant = {
  error: toast.error,
  success: toast.success,
  warning: toast.warning,
  info: toast.info,
} satisfies Record<ToastVariantType, typeof toast.error>

export default function showToast(options: ToastOptions): void {
  const { title, message, variant, action, icon, duration = 3000 } = options

  toastByVariant[variant](title, {
    description: message,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
    icon,
    duration,
  })
}
