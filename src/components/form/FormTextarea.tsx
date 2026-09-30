import { useId } from "react";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import FormField from "./FormField";
import { getInputClassName } from "./formStyles";

type FormTextareaProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
};

function FormTextarea<T extends FieldValues>({
  name,
  label,
  register,
  placeholder,
  rows = 4,
  required,
  disabled,
  error,
  className,
}: FormTextareaProps<T>) {
  const id = useId();

  return (
    <FormField id={id} label={label} required={required} error={error} className={className}>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${getInputClassName(!!error)} resize-y`}
        {...register(name, { disabled })}
      />
    </FormField>
  );
}

export default FormTextarea;
