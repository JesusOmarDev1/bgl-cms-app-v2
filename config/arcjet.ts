import arcjet, { shield, ArcjetMode } from "@arcjet/next"

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({
      mode: process.env.ARCJET_MODE as ArcjetMode,
    }),
  ],
})
