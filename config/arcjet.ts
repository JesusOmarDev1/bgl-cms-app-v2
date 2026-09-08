import arcjet, { shield, ArcjetMode, detectBot, filter } from "@arcjet/next"

const ARCJET_MODE = process.env.ARCJET_MODE! as ArcjetMode;
const ARCJET_KEY = process.env.ARCJET_KEY! as string;

if (!ARCJET_MODE || !ARCJET_KEY) {
  throw new Error("You must set security credentials in the environment variables");
}

export const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    shield({
      mode: ARCJET_MODE,
    }),
    detectBot({
      mode: ARCJET_MODE,
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:GOOGLE",
        "CATEGORY:APPLE",
        "CATEGORY:AI",
        "CATEGORY:ACADEMIC",
        "CATEGORY:YAHOO",
        "CATEGORY:VERCEL",
        "CATEGORY:META",
        "CATEGORY:MICROSOFT",
      ],
    }),
    filter({
      // This will deny any traffic using a VPN, Tor, that matches the curl
      // user agent, or that has no user agent
      deny: [
        'ip.src.vpn or ip.src.tor or lower(http.request.headers["user-agent"]) matches "curl" or len(http.request.headers["user-agent"]) eq 0',
      ],
      mode: ARCJET_MODE,
    }),
  ],
})
