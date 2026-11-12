/**
 * Normalise a Nigerian mobile number to 234XXXXXXXXXX (same rules as the backend).
 * Returns null if it is not a valid Nigerian mobile number.
 */
export function normalizeNigerianPhone(input: string | null | undefined) {
  if (!input) return null;
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("234")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (!/^[789][01]\d{8}$/.test(digits)) return null;
  return `234${digits}`;
}

/** 2348031234567 -> 0803 123 4567 */
export function displayPhone(normalized: string) {
  const local = `0${normalized.slice(3)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

/** WhatsApp click-to-chat link (free, no API). Without a phone, WhatsApp asks who to send to. */
export function whatsappLink(message: string, phone?: string | null) {
  const normalized = normalizeNigerianPhone(phone);
  return `https://wa.me/${normalized ?? ""}?text=${encodeURIComponent(message)}`;
}
