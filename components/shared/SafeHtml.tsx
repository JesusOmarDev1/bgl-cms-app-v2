import type { ElementType, HTMLAttributes } from "react"
import { sanitizeHtml } from "@/lib/formatting/sanitize"
import { injectHeadingIds } from "@/lib/directus/anchor-injector"
import { cn } from "@/lib/utils"

type SafeHtmlProps = {
  content?: string | null
  as?: ElementType
  /** When true, injects `id` attributes into <h1>-<h4> tags for TOC anchor navigation */
  richAnchors?: boolean
  className?: string
} & Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "className" | "dangerouslySetInnerHTML"
>

export function SafeHtml({
  content,
  as: Component = "div",
  richAnchors = false,
  className,
  ...props
}: SafeHtmlProps) {
  if (!content) {
    return null
  }

  const processed = richAnchors ? injectHeadingIds(content) : content
  const sanitized = sanitizeHtml(processed)
  const withTableWrappers = sanitized
    .replace(/<table\b/gi, '<div class="rich-table-wrapper"><table')
    .replace(/<\/table\s*>/gi, "</table></div>")

  return (
    <Component
      className={cn(
        className,
        "min-w-0 [overflow-wrap:anywhere]",
        "[&_img]:rounded-2xl [&_img]:shadow-sm"
      )}
      dangerouslySetInnerHTML={{ __html: withTableWrappers }}
      {...props}
    />
  )
}
