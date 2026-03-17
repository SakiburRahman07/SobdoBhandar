import { format } from "date-fns";

export function formatBanglaDate(value: string | Date, withYear = false) {
  const date = typeof value === "string" ? new Date(value) : value;
  const locale = withYear
    ? { year: "numeric", month: "short", day: "numeric" }
    : { month: "short", day: "numeric" };

  return new Intl.DateTimeFormat("bn-BD", locale).format(date);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("bn-BD", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function maskEmail(email: string | null | undefined) {
  if (!email) return "Anonymous";

  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  if (localPart.length <= 4) {
    return `${localPart[0]}***@${domain}`;
  }

  return `${localPart.slice(0, 2)}***${localPart.slice(-2)}@${domain}`;
}

export function formatRelativeLabel(date: string | null | undefined) {
  if (!date) return "No review";

  const target = new Date(date);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diff = Math.round((target.getTime() - now.getTime()) / 86400000);

  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff} days left`;
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function isoDate(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}
