import { useId } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";

type FormCheckboxProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

// A single checkbox. The form value is true/false.
// The label sits next to the box, so this does not use FormField.
// Takes "control" (not "register") because the shadcn checkbox is not a native <input>.
function FormCheckbox<T extends FieldValues>({
  name,
  label,
  control,
  required,
  disabled,
  className,
}: FormCheckboxProps<T>) {
  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message;

        return (
          <Field orientation="horizontal" data-invalid={!!error} className={className}>
            <Checkbox
              id={id}
              inputRef={field.ref}
              checked={!!field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
              onBlur={field.onBlur}
              disabled={field.disabled}
              aria-required={required}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            <FieldContent>
              <FieldLabel htmlFor={id} className="font-normal">
                {label}
                {required && (
                  <span className="-ml-1.5 text-destructive" aria-hidden="true">
                    *
                  </span>
                )}
              </FieldLabel>
              {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
            </FieldContent>
          </Field>
        );
      }}
    />
  );
}

export default FormCheckbox;
