import { SafeHtml } from "@/components/shared/content/SafeHtml"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
    <Accordion
      allowsMultipleExpanded
      className="gap-4"
      defaultExpandedKeys={groups.map((group) => group.id)}
    >
      {groups.map((group) => (
        <AccordionItem
          className="rounded-xl bg-card/30 px-4 ring-1 ring-foreground/10"
          id={group.id}
          key={group.id}
        >
          <AccordionTrigger className="text-base font-semibold">
            {group.label}
          </AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
