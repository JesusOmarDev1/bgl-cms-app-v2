import { cn } from "@/lib/utils"

interface MaterialIconProps {
  /** Icon name in snake_case (e.g., "phone", "arrow_outward") */
  name: string
  /** Icon size in pixels (default: 18) */
  size?: number
  /** Fill axis (0 = outline, 1 = filled) */
  fill?: 0 | 1
  /** Symbol weight axis (100-700) */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
  /** Additional CSS classes */
  className?: string
}

/**
 * Component to render Material Symbols using @material-symbols/font-400
 *
 * @example
 * // Basic usage
 * <MaterialIcon name="phone" />
 *
 * // With custom size
 * <MaterialIcon name="arrow_outward" size={20} />
 */
export const MaterialIcon = ({
  name,
  size = 20,
  fill = 0,
  weight = 300,
  className,
}: MaterialIconProps) => {
  if (!name) return null

  return (
    <span
      className={cn(
        "material-symbols-rounded",
        "inline-flex shrink-0 items-center justify-center leading-none transition-opacity",
        className
      )}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 48`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
