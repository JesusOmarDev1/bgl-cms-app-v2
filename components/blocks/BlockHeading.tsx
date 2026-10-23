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
    <section className="flex flex-col gap-2">
      {title ? (
        <h2 className="text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl">
          {title}
        </h2>
      ) : null}
      {excerpt ? (
        <SafeHtml content={excerpt} className="text-muted-foreground" />
      ) : null}
    </section>
  )
}
