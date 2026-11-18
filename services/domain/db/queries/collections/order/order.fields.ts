export const ORDER_LIST_FIELDS = [
  "id",
  "folio",
  "date_created",
  "status",
  { client: ["id", "name"] },
  { scales: [{ scales_id: ["id", "title", "serial_number"] }] },
  { technician_name: ["first_name", "last_name"] },
] as const

export const ORDER_DETAIL_FIELDS = [
  ...ORDER_LIST_FIELDS,
  "description",
  "client_name",
  "client_department",
] as const
