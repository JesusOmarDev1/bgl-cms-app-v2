import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async () => {
  const locale = "es" as const

  return {
    locale,
    messages: {
      ...(await import(`./messages/${locale}/email-validator.json`)).default,
      ...(await import(`./messages/${locale}/ofetch.json`)).default,
      ...(await import(`./messages/${locale}/search.json`)).default,
      ...(await import(`./messages/${locale}/visual-editing.json`)).default,
      ...(await import(`./messages/${locale}/share.json`)).default,
      ...(await import(`./messages/${locale}/db.json`)).default,
      ...(await import(`./messages/${locale}/products.json`)).default,
      ...(await import(`./messages/${locale}/catalog.json`)).default,
      ...(await import(`./messages/${locale}/manuals.json`)).default,
      ...(await import(`./messages/${locale}/ai.json`)).default,
      ...(await import(`./messages/${locale}/copy-to-clipboard.json`)).default,
      ...(await import(`./messages/${locale}/theme.json`)).default,
      ...(await import(`./messages/${locale}/health.json`)).default,
      ...(await import(`./messages/${locale}/network.json`)).default,
      ...(await import(`./messages/${locale}/maintenance.json`)).default,
      ...(await import(`./messages/${locale}/unavailable.json`)).default,
      ...(await import(`./messages/${locale}/server-error.json`)).default,
      ...(await import(`./messages/${locale}/debug.json`)).default,
      ...(await import(`./messages/${locale}/cookies.json`)).default,
      ...(await import(`./messages/${locale}/storybook.json`)).default,
    },
  }
})
