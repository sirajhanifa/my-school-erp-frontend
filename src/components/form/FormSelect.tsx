import { useId } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import FormField from "./FormField";
import { getInputClassName } from "./formStyles";
import type { SelectOption } from "./types";

type FormSelectProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

// For short, fixed lists (e.g. Gender, Semester).
// For long or searchable lists use FormAutocomplete instead.
function FormSelect<T extends FieldValues>({
  name,
  label,
  control,
  options,
  placeholder = "Select an option",
  required,
  disabled,
  className,
}: FormSelectProps<T>) {
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
            <select
              id={id}
              {...field}
              value={field.value ?? ""}
              aria-required={required}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className={getInputClassName(!!error)}
            >
              <option value="" disabled>
                {placeholder}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        );
      }}
    />
  );
}

export default FormSelect;
