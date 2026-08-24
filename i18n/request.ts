import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async () => {
  const locale = "es" as const

  return {
    locale,
    messages: {
      ...(await import(`./email-validator/${locale}.json`)).default,
      ...(await import(`./ofetch/${locale}.json`)).default,
      ...(await import(`./search/${locale}.json`)).default,
      ...(await import(`./visual-editing/${locale}.json`)).default,
      ...(await import(`./share/${locale}.json`)).default,
    },
  }
})
