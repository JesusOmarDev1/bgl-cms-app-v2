/** Initials for avatar fallbacks: first letters of both names, uppercased. */
export function getInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const source = `${firstName ?? ""} ${lastName ?? ""}`.trim()
  return (
    source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  )
}
