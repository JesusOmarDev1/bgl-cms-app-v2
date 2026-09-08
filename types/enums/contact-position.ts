export const ContactPositionEnum = [
  "ceo",
  "hr_director",
  "it_support",
  "finance_trainee",
  "sales_executive",
  "report_trainee",
] as const
export type ContactPosition = (typeof ContactPositionEnum)[number]

export const ContactPositionLabel = {
  ceo: "CEO",
  hr_director: "Director de Recursos Humanos",
  it_support: "Soporte de IT",
  finance_trainee: "Auxiliar Administrativo",
  sales_executive: "Ejecutivo de Ventas",
  report_trainee: "Soporte de Reportes",
} as const
export type ContactPositionLabel =
  (typeof ContactPositionLabel)[keyof typeof ContactPositionLabel]
