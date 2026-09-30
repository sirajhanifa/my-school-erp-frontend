// Shared Tailwind classes so every form field in the ERP looks the same.
// Change the look of all fields here instead of editing each component.

const baseInputClassName =
  "block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-xs " +
  "placeholder:text-slate-400 " +
  "focus:outline-none focus:ring-2 " +
  "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const normalBorderClassName =
  "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20";

const errorBorderClassName =
  "border-red-500 focus:border-red-500 focus:ring-red-500/20";

export function getInputClassName(hasError: boolean): string {
  return `${baseInputClassName} ${hasError ? errorBorderClassName : normalBorderClassName}`;
}
