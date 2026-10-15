import { SafeHtml } from "@/components/shared/content/SafeHtml"

export function BlockHeading({
  title,
  excerpt,
}: {
  title?: string | null
  excerpt?: string | null
}) {
  if (!title && !excerpt) return null

  return (
    <header className="flex flex-col gap-2">
      {title ? <h2>{title}</h2> : null}
      {excerpt ? <SafeHtml content={excerpt} preset="compact" /> : null}
    </header>
  )
}
