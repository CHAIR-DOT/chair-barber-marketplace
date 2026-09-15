export const TIME_ZONE = "Asia/Tbilisi";
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function addDays(days: number, from = today()) {
  const d = new Date(`${from}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...options,
    timeZone: TIME_ZONE,
  }).format(new Date(`${date}T12:00:00Z`));
}
export function relativeDate(date: string) {
  return date === today()
    ? "Today"
    : date === addDays(1)
      ? "Tomorrow"
      : formatDate(date, { weekday: "short" });
}
export function minutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
export function currentMinutes() {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
  return minutes(time);
}
export const money = (value: number) => `₾${value}`;
