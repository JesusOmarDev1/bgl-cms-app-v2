import type { FaqBlock } from "@/types/blocks/faq/faq-block"
import type { FaqQuestions } from "@/types/blocks/faq/faq-questions"

export type FaqBlockQuestionsCollection = "faq_questions"

export interface FaqBlockQuestionsJunction {
  id: number
  faq_block_id: string | FaqBlock
  collection: FaqBlockQuestionsCollection
  item: string | FaqQuestions
}
