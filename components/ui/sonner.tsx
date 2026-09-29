"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <MaterialIcon name="check_circle" size={16} />,
        info: <MaterialIcon name="info" size={16} />,
        warning: <MaterialIcon name="warning" size={16} />,
        error: <MaterialIcon name="cancel" size={16} />,
        loading: (
          <MaterialIcon
            name="progress_activity"
            size={16}
            className="animate-spin"
          />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
