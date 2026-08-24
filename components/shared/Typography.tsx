import { TypographyType } from "@/types/enums/typography"

export interface TypographyProps {
  children: React.ReactNode
  type: TypographyType
  className?: string
  data?: Record<string, unknown>
}
