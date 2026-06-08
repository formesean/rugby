import { format, formatDistanceToNowStrict } from "date-fns";

export function timeAgo(date: Date | string): string {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateLong(date: Date | string): string {
  return format(new Date(date), "MMMM d, yyyy");
}

export function formatDateFromParts(isoDateOnly: string): string {
  const [year, month, day] = isoDateOnly.split("-").map(Number);
  return format(new Date(year, month - 1, day), "MMM d");
}
