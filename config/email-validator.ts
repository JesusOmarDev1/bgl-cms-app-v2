import { validate as deepValidate } from "deep-email-validator"
import { useTranslations } from "next-intl"

export async function validateEmail(
  email: string
): Promise<{ valid: boolean; reason?: string | null }> {
  const t = useTranslations("email-validator")

  try {
    const result = await deepValidate(email)
    return { valid: result.valid, reason: result.reason }
  } catch (error) {
    return {
      valid: false,
      reason:
        error instanceof Error ? error.message : (t("invalid_email") as string),
    }
  }
}
