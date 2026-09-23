import "@/app/globals.css"
import type { Preview } from "@storybook/nextjs-vite"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { themes, ensure } from "storybook/theming"

let storyQueryClient: QueryClient | undefined

function getStoryQueryClient() {
  storyQueryClient ??= new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return storyQueryClient
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={getStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
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
