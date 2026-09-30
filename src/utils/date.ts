// Today's date as "YYYY-MM-DD" in the user's local time zone.
// (toISOString() is not used because it converts to UTC and can return yesterday/tomorrow.)
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
