/**
 * Format price consistently across the entire app.
 * Admin stores only the number, public site always shows "X AZN".
 * Handles edge cases like "8 / 11 AZN" correctly.
 */
export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";

  const raw = String(value).trim();
  if (!raw) return "";

  // Already contains AZN → return as-is (e.g. "8 / 11 AZN")
  if (raw.toUpperCase().includes("AZN")) {
    return raw;
  }

  // Pure number → append AZN (e.g. "10" → "10 AZN")
  return `${raw} AZN`;
}

/**
 * Normalize price for admin input — strips AZN, keeps only number.
 */
export function normalizePrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  return String(value)
    .replace(/\s*AZN\s*$/i, "")
    .replace(/[^0-9.\/\s]/g, "")
    .trim();
}
