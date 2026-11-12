"use client"

import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

/**
 * Compact light/dark switch for the private navbar. The System option and
 * the visual scheme picker live in the settings dialog (ThemeSchemePicker).
 */
export function ThemeToggle({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("theme")

  // resolvedTheme is undefined until mounted; the icon then defaults to dark,
  // matching the app default, without a hydration mismatch.
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("toggle")}
      onPress={() => setTheme(isDark ? "light" : "dark")}
      className={className}
      {...props}
    >
      <MaterialIcon
        name={isDark ? "light_mode" : "dark_mode"}
        size={20}
        className="transition-[transform,opacity] duration-200 data-[switching=true]:scale-75"
      />
    </Button>
  )
}
