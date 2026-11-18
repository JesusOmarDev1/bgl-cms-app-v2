import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { BouncyAccordion } from "@/components/shared/utility/BouncyAccordion"

export type ProductAttributeGroupView = {
  id: string
  label: string
  items: {
    id: string
    title: string
    value: string
    unit: string | null
  }[]
}

export function ProductAttributes({
  groups,
}: {
  groups: ProductAttributeGroupView[]
}) {
  if (groups.length === 0) return null

  return (
    <BouncyAccordion
      collapsible
      classNames={{
        content: "pb-0",
        description: "text-foreground",
      }}
      defaultValue={groups[0].id}
      items={groups.map((group) => ({
        id: group.id,
        title: group.label,
        description: (
          <ul className="divide-y divide-border">
            {group.items.map((item) => (
              <li
                className="flex items-start justify-between gap-4 py-3"
                key={item.id}
              >
                <span className="min-w-0">{item.title}</span>
                <div className="flex max-w-[60%] flex-wrap justify-end gap-x-1 text-end text-muted-foreground">
                  <SafeHtml as="span" content={item.value} unstyled />
                  {item.unit ? <span>{item.unit}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        ),
      }))}
    />
  )
}
