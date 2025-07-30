export function createAcronym(text: string, maxLength = 2): string {
  return text
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("")
    .slice(0, maxLength);
}
