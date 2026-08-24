export const ToastVariantEnum = ["error", "success", "warning", "info"] as const
export type ToastVariantType = (typeof ToastVariantEnum)[number]
