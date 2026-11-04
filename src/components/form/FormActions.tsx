import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type FormActionsProps = {
  submitLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
  // The Save and Cancel buttons only appear when you pass their handlers.
  onSave?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  // Stretch the buttons to fill the row (e.g. the Login button)
  fullWidth?: boolean;
};

// The row of buttons at the bottom of every form: Cancel, Save and Submit.
// Submit = solid blue (main action), Save = outline, Cancel = text only.
const FormActions = ({
  submitLabel = "Submit",
  saveLabel = "Save",
  cancelLabel = "Cancel",
  onSave,
  onCancel,
  isSubmitting = false,
  disabled = false,
  fullWidth = false,
}: FormActionsProps) => {
  const isDisabled = disabled || isSubmitting;
  // Full width: buttons fill the row. Otherwise: buttons sit on the right from "sm" up.
  const rowLayoutClassName = fullWidth ? "" : "sm:flex-row sm:items-center sm:justify-end";

  return (
    // Phones: full-width buttons stacked with Submit on top.
    // From "sm" up: one row aligned to the right.
    <div className={`flex flex-col-reverse gap-3 border-t pt-6 ${rowLayoutClassName}`}>
      {onCancel && (
        <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={isSubmitting} className="min-w-24">
          {cancelLabel}
        </Button>
      )}

      {onSave && (
        <Button type="button" variant="outline" size="lg" onClick={onSave} disabled={isDisabled} className="min-w-24">
          {saveLabel}
        </Button>
      )}

      {/* aria-busy tells screen readers the form is being submitted */}
      <Button type="submit" size="lg" disabled={isDisabled} aria-busy={isSubmitting} className="min-w-24">
        {isSubmitting && <Spinner />}
        {isSubmitting ? "Please wait..." : submitLabel}
      </Button>
    </div>
  );
};

export default FormActions;
