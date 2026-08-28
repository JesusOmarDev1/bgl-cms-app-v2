import type * as React from "react"

import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import { Button } from "@/components/ui/button"

export type ButtonWithIconProps = Omit<
  React.ComponentProps<typeof Button>,
  "children"
> & {
  icon: string
  iconAlignment?: "start" | "end"
  iconSize?: number
  children?: React.ReactNode
}

export function ButtonWithIcon({
  icon,
  iconAlignment = "start",
  iconSize = 16,
  children,
  ...props
}: ButtonWithIconProps) {
  const iconEl = (
    <MaterialIcon
      name={icon}
      size={iconSize}
      data-icon={iconAlignment === "end" ? "inline-end" : "inline-start"}
      className="pointer-events-none"
    />
  )

  return (
    <Button {...props}>
      {iconAlignment !== "end" ? iconEl : null}
      {children}
      {iconAlignment === "end" ? iconEl : null}
    </Button>
  )
}
