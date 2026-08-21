import { cookies } from "next/headers"
import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async () => {
  const store = await cookies()
  const locale = store.get("locale")?.value || "es"

  return {
    locale,
    "email-validator": (await import(`./email-validator/${locale}.json`))
      .default,
  }
})
