import type { ReactNode } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
};

// Renders the label, the field itself (children) and the error message.
// Used internally by the form field components so they all share the same layout.
const FormField = ({ id, label, required, error, className, children }: FormFieldProps) => {
  return (
    // data-invalid turns the label red when there is an error
    <Field data-invalid={!!error} className={className}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && (
          <span className="-ml-1.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </FieldLabel>

      {children}

      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
};

export default FormField;
