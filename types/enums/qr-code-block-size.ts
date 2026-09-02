export const QrCodeBlockSizeEnum = ["small", "medium", "big"] as const
export type QrCodeBlockSize = (typeof QrCodeBlockSizeEnum)[number]
