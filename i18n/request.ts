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
      ...(await import(`./db/${locale}.json`)).default,
      ...(await import(`./ai/${locale}.json`)).default,
      ...(await import(`./copy-to-clipboard/${locale}.json`)).default,
      ...(await import(`./theme/${locale}.json`)).default,
      ...(await import(`./health/${locale}.json`)).default,
      ...(await import(`./maintenance/${locale}.json`)).default,
      ...(await import(`./debug/${locale}.json`)).default,
    },
  }
})
