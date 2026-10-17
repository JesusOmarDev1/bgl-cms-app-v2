import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { FaqBlock } from "@/types/blocks/faq/faq-block"
import type { Schema } from "@/types/schema"

export const FAQ_BLOCK_FIELDS = [
  "id",
  "title",
  "sort",
  "excerpt",
  "date_created",
  "date_updated",
  {
    questions: [
      "id",
      "collection",
      { item: { faq_questions: ["id", "question", "answer"] } },
    ],
  },
] as const satisfies NonNullable<Query<Schema, FaqBlock>["fields"]>

export type FaqBlockQuery = ApplyQueryFields<
  Schema,
  FaqBlock,
  typeof FAQ_BLOCK_FIELDS
>
