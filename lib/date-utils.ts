import { format, toZonedTime } from "date-fns-tz";

const IST_TIMEZONE = "Asia/Kolkata";

export function formatDateToIST(dateString: string): string {
  const date = new Date(dateString);
  const zonedDate = toZonedTime(date, IST_TIMEZONE);
  return format(zonedDate, "MMM dd, yyyy, hh:mm a", {
    timeZone: IST_TIMEZONE,
  });
}
