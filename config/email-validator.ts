import { validate as deepValidate } from "deep-email-validator"
import emailValidatorMessages from "@/i18n/email-validator/es.json"

export async function validateEmail(
  email: string
): Promise<{ valid: boolean; reason?: string | null }> {
  try {
    const result = await deepValidate(email)
    return { valid: result.valid, reason: result.reason }
  } catch (error) {
    return {
      valid: false,
      reason:
        error instanceof Error
          ? error.message
          : emailValidatorMessages["email-validator"].invalid_email,
    }
  }
}
