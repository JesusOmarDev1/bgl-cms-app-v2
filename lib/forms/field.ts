export const fieldSurface =
  "bg-background border-input dark:bg-input/30 rounded-lg border shadow-xs transition-[border-color,box-shadow] outline-none hover:border-foreground/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive";

export function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}
