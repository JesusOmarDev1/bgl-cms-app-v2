import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier/flat"
import reactDoctor from "eslint-plugin-react-doctor"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  reactDoctor.configs.recommended,
  reactDoctor.configs.next,
  reactDoctor.configs["tanstack-query"],
  globalIgnores([
    "node_modules/**",
    ".next/**",
    ".agents/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".codegraph/**",
    ".cursor/**",
    ".vscode/**",
    ".github/**",
    ".ai/**",
    "tsconfig.tsbuildinfo",
    ".gga",
    ".env.example",
    "components/ui/**/*.{js,jsx,ts,tsx}",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
])

export default eslintConfig
