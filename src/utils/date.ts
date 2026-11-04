// A date as "YYYY-MM-DD" in the user's local time zone.
// (toISOString() is not used because it converts to UTC and can return yesterday/tomorrow.)
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// "YYYY-MM-DD" back to a Date at local midnight.
// (new Date("2024-06-01") would read it as UTC and can land on the day before.)
export function fromDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Today's date as "YYYY-MM-DD" in the user's local time zone.
export function getTodayDateString(): string {
  return toDateString(new Date());
}
