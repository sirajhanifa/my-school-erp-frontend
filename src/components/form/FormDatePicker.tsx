import { useId } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import FormField from "./FormField";
import { getInputClassName } from "./formStyles";

type FormDatePickerProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
  // Dates use the "YYYY-MM-DD" format, e.g. "2024-06-01".
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

// Uses the browser's built-in date picker, so no extra library is needed.
// The form value is a "YYYY-MM-DD" string (or "" when empty).
function FormDatePicker<T extends FieldValues>({
  name,
  label,
  control,
  minDate,
  maxDate,
  required,
  disabled,
  className,
}: FormDatePickerProps<T>) {
  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message;

        return (
          <FormField id={id} label={label} required={required} error={error} className={className}>
            <input
              id={id}
              type="date"
              min={minDate}
              max={maxDate}
              {...field}
              value={field.value ?? ""}
              aria-required={required}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className={getInputClassName(!!error)}
            />
          </FormField>
        );
      }}
    />
  );
}

export default FormDatePicker;
