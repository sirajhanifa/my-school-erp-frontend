import Spinner from "./Spinner";

type FormActionsProps = {
  submitLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
  // The Save and Cancel buttons only appear when you pass their handlers.
  onSave?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
};

// Shared by all buttons: same height, shape and text, so they line up in the row.
// "enabled:" = hover and press effects only apply when the button can be clicked.
const buttonBaseClassName =
  "inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold " +
  "transition duration-150 ease-in-out enabled:active:scale-[0.98] " +
  // Focus ring only for keyboard users (not on mouse click)
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

// Submit: the main action, solid blue
const primaryButtonClassName =
  `${buttonBaseClassName} bg-blue-600 text-white shadow-sm ` +
  "enabled:hover:bg-blue-700 enabled:hover:shadow-md focus-visible:ring-blue-500";

// Save: a secondary action, white with a border
const secondaryButtonClassName =
  `${buttonBaseClassName} border border-slate-300 bg-white text-slate-700 shadow-xs ` +
  "enabled:hover:border-slate-400 enabled:hover:bg-slate-50 focus-visible:ring-blue-500";

// Cancel: the least important action, text only
const ghostButtonClassName =
  `${buttonBaseClassName} text-slate-600 ` +
  "enabled:hover:bg-slate-100 enabled:hover:text-slate-900 focus-visible:ring-slate-400";

// The row of buttons at the bottom of every form: Cancel, Save and Submit.
const FormActions = ({
  submitLabel = "Submit",
  saveLabel = "Save",
  cancelLabel = "Cancel",
  onSave,
  onCancel,
  isSubmitting = false,
  disabled = false,
}: FormActionsProps) => {
  const isDisabled = disabled || isSubmitting;

  return (
    // Phones: full-width buttons stacked with Submit on top.
    // From "sm" up: one row aligned to the right.
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
      {onCancel && (
        <button type="button" onClick={onCancel} disabled={isSubmitting} className={ghostButtonClassName}>
          {cancelLabel}
        </button>
      )}

      {onSave && (
        <button type="button" onClick={onSave} disabled={isDisabled} className={secondaryButtonClassName}>
          {saveLabel}
        </button>
      )}

      {/* aria-busy tells screen readers the form is being submitted */}
      <button type="submit" disabled={isDisabled} aria-busy={isSubmitting} className={primaryButtonClassName}>
        {isSubmitting && <Spinner />}
        {isSubmitting ? "Please wait..." : submitLabel}
      </button>
    </div>
  );
};

export default FormActions;
