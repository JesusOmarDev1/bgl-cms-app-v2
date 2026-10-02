import type { FormBlock } from "@/types/blocks/form/form-block"
import type { FormResponseStatusType } from "@/types/enums/form-response-status"

export type FormResponseAnswer = Record<
  string,
  string | number | boolean | null
>

export interface FormResponsesTypes {
  // General
  id: string
  status: FormResponseStatusType
  form: string | FormBlock
  answer: FormResponseAnswer
  sort: number | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
