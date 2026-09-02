import type { CheckboxBlock } from "@/types/blocks/form/fields/checkbox-block"
import type { DateBlock } from "@/types/blocks/form/fields/date-block"
import type { EmailBlock } from "@/types/blocks/form/fields/email-block"
import type { NumberBlock } from "@/types/blocks/form/fields/number-block"
import type { PhoneBlock } from "@/types/blocks/form/fields/phone-block"
import type { TextAreaBlock } from "@/types/blocks/form/fields/text-area-block"
import type { TextBlock } from "@/types/blocks/form/fields/text-block"
import type { FormBlock } from "@/types/blocks/form/form-block"

export type FormBlockFieldsCollection =
  | "text_block"
  | "text_area_block"
  | "number_block"
  | "date_block"
  | "email_block"
  | "checkbox_block"
  | "phone_block"

export interface FormBlockFieldsJunction {
  id: number
  form_block_id: string | FormBlock
  collection: FormBlockFieldsCollection
  item:
    | string
    | TextBlock
    | TextAreaBlock
    | NumberBlock
    | DateBlock
    | EmailBlock
    | CheckboxBlock
    | PhoneBlock
}
