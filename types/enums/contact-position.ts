export const ContactPositionEnum = [
  "ceo",
  "hr_director",
  "it_support",
  "finance_trainee",
  "sales_executive",
  "report_trainee",
] as const
export type ContactPosition = (typeof ContactPositionEnum)[number]
