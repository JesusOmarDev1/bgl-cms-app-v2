"use client"

import { useState, type ReactNode } from "react"
import { setAttr } from "@directus/visual-editing"
import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { BouncyAccordion } from "@/components/shared/utility/BouncyAccordion"
import { fuzzySearch } from "@/config/search"
import type { FaqBlockQuery } from "@/services/domain/db/queries/blocks/faq-block/faq-block.fields"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"

type FaqItem = {
  id: string
  question: string
  answer: string
  text: string
}

function plainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
}

export function FaqClient({ data }: { data: FaqBlockQuery }) {
  const items: FaqItem[] = []
  for (const row of data.questions ?? []) {
    if (!row.item?.question) continue
    const answer = row.item.answer ?? ""
    items.push({
      id: String(row.id),
      question: row.item.question,
      answer,
      text: plainText(answer),
    })
  }
  const [query, setQuery] = useState("")
  const visible = fuzzySearch(items, query, {
    keys: ["question", "text"],
  })
  const accordionItems: {
    id: string
    title: string
    description?: ReactNode
  }[] = visible.map((item) => ({
    id: item.id,
    title: item.question,
    description: item.answer ? (
      <SafeHtml content={item.answer} preset="compact" />
    ) : undefined,
  }))

  if (!data.title && !data.excerpt && items.length === 0) return null

  return (
    <Box
      data-directus={setAttr({
        collection: "faq_block",
        item: data.id ?? null,
        fields: "title, excerpt, questions",
        mode: "popover",
      })}
      display="flex"
      orientation="vertical"
      gap={1.5}
      padding={2}
    >
      {data.title ? (
        <h2 className="text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl">
          {data.title}
        </h2>
      ) : null}
      {data.excerpt ? (
        <SafeHtml content={data.excerpt} className="text-muted-foreground" />
      ) : null}
      {items.length > 0 ? (
        <InputGroup className="w-full">
          <InputGroupInput
            placeholder="Buscar preguntas frecuentes..."
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <InputGroupAddon>
            <MaterialIcon name="search" size={16} />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {visible.length} {visible.length === 1 ? "resultado" : "resultados"}
          </InputGroupAddon>
        </InputGroup>
      ) : null}
      {accordionItems.length > 0 ? (
        <BouncyAccordion items={accordionItems} />
      ) : null}
    </Box>
  )
}
