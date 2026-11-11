import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useTranslations } from "next-intl"

interface OtpFieldProps {
  value: string
  onChange: (value: string) => void
  submitting: boolean
}

export function OtpField({ value, onChange, submitting }: OtpFieldProps) {
  const t = useTranslations("auth")
  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium">{t("otpLabel")}</span>
      <InputOTP
        value={value}
        onChange={onChange}
        maxLength={6}
        inputMode="numeric"
        autoComplete="one-time-code"
        disabled={submitting}
        autoFocus
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <span className="block text-xs text-muted-foreground">
        {t("otpHint")}
      </span>
    </div>
  )
}
