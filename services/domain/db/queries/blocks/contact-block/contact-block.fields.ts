import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { ContactBlock } from "@/types/blocks/content/contact-block"
import type { Schema } from "@/types/schema"

export const CONTACT_BLOCK_FIELDS = [
  "id",
  "title",
  "excerpt",
  "address",
  {
    phones: ["id", { phones_id: ["phone", "position"] }],
    emails: ["id", { emails_id: ["email", "position"] }],
  },
] as const satisfies NonNullable<Query<Schema, ContactBlock>["fields"]>

export type ContactBlockQuery = ApplyQueryFields<
  Schema,
  ContactBlock,
  typeof CONTACT_BLOCK_FIELDS
>
