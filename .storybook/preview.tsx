import "@/app/globals.css"
import type { Preview } from "@storybook/nextjs-vite"
import { themes } from "storybook/theming"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    themes: themes.dark,
  },
}

export default preview
