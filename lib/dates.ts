// Group dates are calendar days in Nigeria time (WAT, UTC+1, no daylight saving).
const NIGERIA_TZ = "Africa/Lagos";

/** "2026-11-16" from a date picker -> ISO string for midnight that day in Nigeria. */
export function dateInputToISO(value: string) {
  return new Date(`${value}T00:00:00+01:00`).toISOString();
}

/** ISO date -> "YYYY-MM-DD" for a date input, as the calendar day in Nigeria. */
export function toDateInputValue(value: string | Date | undefined | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: NIGERIA_TZ }).format(date);
}

/** ISO date -> "YYYY-MM-DDTHH:mm" for a datetime-local input, in Nigeria time. */
export function toDateTimeInputValue(value: string | Date | undefined | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: NIGERIA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** datetime-local value (Nigeria time) -> ISO string. */
export function dateTimeInputToISO(value: string) {
  return new Date(`${value}:00+01:00`).toISOString();
}

/** The last day members can pay: the day before the cycle's end boundary. */
export function lastPayDay(cycleEnd: string) {
  return new Date(new Date(cycleEnd).getTime() - 1).toISOString();
}
