import { useId } from "react";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

type FormCheckboxProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
};

// A single checkbox. The form value is true/false.
// The label sits next to the box, so this does not use FormField.
function FormCheckbox<T extends FieldValues>({
  name,
  label,
  register,
  required,
  disabled,
  error,
  className,
}: FormCheckboxProps<T>) {
  const id = useId();

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-4 w-4 rounded border-slate-300 accent-blue-600 disabled:cursor-not-allowed"
          {...register(name, { disabled })}
        />
        <label
          htmlFor={id}
          className={`text-sm ${disabled ? "cursor-not-allowed text-slate-400" : "text-slate-700"}`}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormCheckbox;
