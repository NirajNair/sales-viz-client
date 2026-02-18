import { format, toZonedTime, formatInTimeZone } from "date-fns-tz";
import { subMonths } from "date-fns";

const IST_TIMEZONE = "Asia/Kolkata";
const UTC_TIMEZONE = "UTC";

export function formatDateToIST(dateString: string): string {
  const date = new Date(dateString);
  const zonedDate = toZonedTime(date, IST_TIMEZONE);
  return format(zonedDate, "MMM dd, yyyy, hh:mm a", {
    timeZone: IST_TIMEZONE,
  });
}

// Convert UTC ISO to IST display format (dd/MM/yyyy)
export function toIstDisplay(utcDateString: string): string {
  return formatInTimeZone(new Date(utcDateString), IST_TIMEZONE, "dd/MM/yyyy");
}

// Convert date to UTC ISO for API
export function toUtcIso(date: Date): string {
  return formatInTimeZone(date, UTC_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

// Get default date range (last 3 months)
export function getDefaultDateRange(): { from: Date; to: Date } {
  const to = new Date();
  const from = subMonths(to, 3);
  return { from, to };
}
