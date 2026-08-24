export function truncateIp(ip: string): string {
  if (!ip || ip === "unknown") return ip
  if (ip.includes(".")) {
    const parts = ip.split(".")
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`
  }
  if (ip.includes(":")) {
    const parts = ip.split(":")
    return `${parts.slice(0, 2).join(":")}:…`
  }
  return ip.length > 8 ? `${ip.slice(0, 8)}…` : ip
}
