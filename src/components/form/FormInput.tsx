import { useId } from "react";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FormField from "./FormField";

type FormInputType = "text" | "email" | "password" | "number" | "tel" | "url";

type FormInputProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  type?: FormInputType;
  placeholder?: string;
  // Only shows the "*" marker. The real rule lives in the Zod schema.
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
};

function FormInput<T extends FieldValues>({
  name,
  label,
  register,
  type = "text",
  placeholder,
  required,
  disabled,
  error,
  className,
}: FormInputProps<T>) {
  const id = useId();

  return (
    <FormField id={id} label={label} required={required} error={error} className={className}>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-9"
        {...register(name, { disabled, valueAsNumber: type === "number" })}
      />
    </FormField>
  );
}

export default FormInput;
