import type { FaqBlockQuestionsJunction } from "@/types/collections/junctions/faq-block-questions"

export interface FaqBlock {
  // General
  id: string
  title: string
  sort: number | null
  excerpt: string
  questions: number[] | FaqBlockQuestionsJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
