import type { ElementType, HTMLAttributes } from "react"
import { sanitizeHtml } from "@/lib/formatting/sanitize"
import { injectHeadingIds } from "@/lib/directus/anchor-injector"
import { cn } from "@/lib/utils"

type TypesetPreset = "article" | "compact"

type SafeHtmlProps = {
  content?: string | null
  as?: ElementType
  /** When true, injects `id` attributes into <h1>-<h4> tags for TOC anchor navigation */
  richAnchors?: boolean
  className?: string
  /** Typeset rhythm preset. Ignored when `unstyled` is true. */
  preset?: TypesetPreset
  /** Skip Typeset classes; sanitized HTML only. */
  unstyled?: boolean
} & Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "className" | "dangerouslySetInnerHTML"
>

export function SafeHtml({
  content,
  as: Component = "div",
  richAnchors = false,
  className,
  preset = "article",
  unstyled = false,
  ...props
}: SafeHtmlProps) {
  if (!content) {
    return null
  }

  const processed = richAnchors ? injectHeadingIds(content) : content
  const sanitized = sanitizeHtml(processed)
  const withTableWrappers = sanitized
    .replace(/<table\b/gi, '<div class="typeset-scroll"><table')
    .replace(/<\/table\s*>/gi, "</table></div>")

  return (
    <Component
      className={cn(
        !unstyled && ["typeset", `typeset-${preset}`],
        "min-w-0 wrap-anywhere",
        className
      )}
      dangerouslySetInnerHTML={{ __html: withTableWrappers }}
      {...props}
    />
  )
}
