export const QrCodeBlockAlignmentEnum = ["left", "center", "right"] as const
export type QrCodeBlockAlignment = (typeof QrCodeBlockAlignmentEnum)[number]
