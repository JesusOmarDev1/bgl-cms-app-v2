import "@/app/globals.css"
import type { Preview } from "@storybook/nextjs-vite"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { themes, ensure } from "storybook/theming"
import { geist, geistMono } from "@/lib/fonts/geist"
import storybookMessages from "@/i18n/storybook/es.json"

type StoryTheme = "light" | "dark"

function isStoryTheme(value: unknown): value is StoryTheme {
  return value === "light" || value === "dark"
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Tema",
      description: "Tema claro u oscuro del canvas",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Claro" },
          { value: "dark", title: "Oscuro" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "dark",
  },
  decorators: [
    (Story, context) => {
      const theme: StoryTheme = isStoryTheme(context.globals.theme)
        ? context.globals.theme
        : "dark"

      return (
        <NextIntlClientProvider locale="es" messages={storybookMessages}>
          <div
            className={`${theme === "dark" ? "dark" : ""}min-h-screen bg-background text-foreground antialiased ${geist.variable} ${geistMono.variable}`}
          >
            <NextThemesProvider
              attribute="class"
              enableSystem={false}
              forcedTheme={theme}
              disableTransitionOnChange
            >
              <Story />
            </NextThemesProvider>
          </div>
        </NextIntlClientProvider>
      )
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
      codePanel: true,
    },
    themes: ensure(themes.dark),
  },
}

export default preview
