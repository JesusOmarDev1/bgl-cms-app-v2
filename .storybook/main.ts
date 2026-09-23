import { fileURLToPath } from "node:url"
import type { StorybookConfig } from "@storybook/nextjs-vite"

const stub = fileURLToPath(new URL("./stub.ts", import.meta.url))

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-vitest",
    "@storybook/addon-mcp",
    "@storybook/addon-themes",
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["..\\public"],
  async viteFinal(config) {
    const current = config.resolve?.alias
    const existing = Array.isArray(current)
      ? current
      : current
        ? Object.entries(current).map(([find, replacement]) => ({
            find,
            replacement,
          }))
        : []

    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: [
          { find: "@/config/meilisearch", replacement: stub },
          ...existing,
        ],
      },
    }
  },
}
export default config
