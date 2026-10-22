// A date as "YYYY-MM-DD" in the user's local time zone.
// (toISOString() is not used because it converts to UTC and can return yesterday/tomorrow.)
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Today's date as "YYYY-MM-DD" in the user's local time zone.
export function getTodayDateString(): string {
  return toDateString(new Date());
}
