import { useId } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormField from "./FormField";
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

  // The "null" item is what the trigger shows when nothing is picked yet
  const items = [{ label: placeholder, value: null }, ...options];

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message;

        return (
          <FormField id={id} label={label} required={required} error={error} className={className}>
            {/* The form stores "" for "nothing picked"; the Select uses null for that */}
            <Select
              items={items}
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              disabled={field.disabled}
            >
              <SelectTrigger
                id={id}
                ref={field.ref}
                onBlur={field.onBlur}
                aria-required={required}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className="w-full data-[size=default]:h-9"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        );
      }}
    />
  );
}

export default FormSelect;
