/** Pay Small Small stores money as integer kobo. */

/** "₦15,000" or "₦15,000.50" from kobo. */
export function formatKobo(kobo: number | null | undefined) {
  const value = Number(kobo ?? 0);
  const hasKobo = value % 100 !== 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: hasKobo ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

/** "15,000.50" typed by a user -> 1500050 kobo, or null if not a valid amount. */
export function nairaInputToKobo(value: string | FormDataEntryValue | null) {
  const cleaned = String(value ?? "").replace(/[,\s₦]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}
