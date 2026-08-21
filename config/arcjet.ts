import arcjet, { shield, ArcjetMode, detectBot, filter } from "@arcjet/next"

export const aj = arcjet({
  key: process.env.ARCJET_KEY! as string,
  rules: [
    shield({
      mode: process.env.ARCJET_MODE! as ArcjetMode,
    }),
    detectBot({
      mode: process.env.ARCJET_MODE! as ArcjetMode,
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:GOOGLE"],
    }),
    filter({
      // This will deny any traffic using a VPN, Tor, that matches the curl
      // user agent, or that has no user agent
      deny: [
        'ip.src.vpn or ip.src.tor or lower(http.request.headers["user-agent"]) matches "curl" or len(http.request.headers["user-agent"]) eq 0',
      ],
      mode: process.env.ARCJET_MODE! as ArcjetMode,
    }),
  ],
})
