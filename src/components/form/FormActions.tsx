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

const buttonBaseClassName =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const primaryButtonClassName = `${buttonBaseClassName} bg-blue-600 text-white shadow-xs hover:bg-blue-700`;

const secondaryButtonClassName = `${buttonBaseClassName} border border-slate-300 bg-white text-slate-700 shadow-xs hover:bg-slate-50`;

const ghostButtonClassName = `${buttonBaseClassName} text-slate-600 hover:bg-slate-100`;

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
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
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

      <button type="submit" disabled={isDisabled} className={primaryButtonClassName}>
        {isSubmitting && <Spinner />}
        {isSubmitting ? "Please wait..." : submitLabel}
      </button>
    </div>
  );
};

export default FormActions;
