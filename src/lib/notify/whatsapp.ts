/** Digits only; Dutch local `0…` → `31…` (e.g. 06… → 316…). */
export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `31${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Build a wa.me deeplink with prefilled message.
 * Returns undefined when phone is missing or too short after normalization.
 */
export function buildWhatsAppUrl(
  phone: string,
  text: string,
): string | undefined {
  const trimmed = phone.trim();
  if (!trimmed) return undefined;

  const digits = normalizeWhatsAppPhone(trimmed);
  if (!digits || digits.length < 8) return undefined;

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
