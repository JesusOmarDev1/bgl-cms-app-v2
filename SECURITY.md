# Security

This repo is private. Report issues against the current tree.

## Reporting

Email [soporte@bglbasculas.com](mailto:soporte@bglbasculas.com).

Public policy: [https://bglbasculas.com.mx/legal/politicas-de-seguridad](https://bglbasculas.com.mx/legal/politicas-de-seguridad).

[public/.well-known/security.txt](public/.well-known/security.txt) lists `bglbasculas@gmail.com`.

## Controls

Response security headers have one writer. [proxy.ts](proxy.ts) calls `setSecurityHeaders` in [config/headers.ts](config/headers.ts). The CSP string is the static list in [config/csp.ts](config/csp.ts). Do not add a second writer in `next.config.ts` `headers()`.

- `Strict-Transport-Security` is set only when `NODE_ENV` is `production`.
- With visual editing off, responses include `X-Frame-Options: DENY` and `Cross-Origin-Opener-Policy: same-origin`.

[config/arcjet.ts](config/arcjet.ts) runs Arcjet shield, bot detection, and a filter that denies VPN, Tor, curl, and empty user agents.

Cloudflare Turnstile keys live in [.env.example](.env.example) (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`). [config/csp.ts](config/csp.ts) allows `https://challenges.cloudflare.com`.

Search is limited by [config/rate-limiter.ts](config/rate-limiter.ts): Redis (`searchLimiter`) with an in-memory `insuranceLimiter` when Redis errors.

Secrets stay in `.env`. Copy [.env.example](.env.example). Do not commit `.env`.
