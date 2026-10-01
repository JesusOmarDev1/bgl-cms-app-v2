import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { BouncyAccordion } from "@/components/shared/utility/BouncyAccordion"
import { FaqBlock } from "@/types/blocks/faq/faq-block"
import type { FaqQuestions } from "@/types/blocks/faq/faq-questions"
import { setAttr } from "@directus/visual-editing"

interface FaqClientProps {
  data: {
    id: FaqBlock["id"]
    title: FaqBlock["title"]
    excerpt: FaqBlock["excerpt"]
    questions: {
      id: number
      item: Pick<FaqQuestions, "id" | "question" | "answer">
    }[]
  }
}

export function FaqClient({ data }: FaqClientProps) {
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
      gap={2}
    >
      <h2>{data.title}</h2>
      <SafeHtml content={data.excerpt} preset="compact" />
      <BouncyAccordion
        items={data.questions.map((row) => ({
          id: String(row.id),
          title: row.item.question,
          description: <SafeHtml content={row.item.answer} preset="compact" />,
        }))}
      />
    </Box>
  )
}
