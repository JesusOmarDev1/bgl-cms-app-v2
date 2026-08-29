import { defineConfig } from "react-doctor/api"

export default defineConfig({
  ignore: {
    rules: ["react-doctor/no-danger"],
    files: [
      "node_modules/**",
      ".next/**",
      ".agents/**",
      "next-env.d.ts",
      ".codegraph/**",
      ".cursor/**",
      ".vscode/**",
      ".github/**",
      ".ai/**",
      "tsconfig.tsbuildinfo",
      ".gga",
      ".env.example",
      "pnpm-workspace.yaml",
      "components/ui/**",
    ],
  },
})
