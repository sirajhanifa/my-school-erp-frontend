import type { FormEventHandler, ReactNode } from "react";

type FormContainerSize = "sm" | "md" | "lg" | "xl" | "full";

type FormContainerProps = {
  title?: string;
  description?: string;
  size?: FormContainerSize;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
};

const sizeClassNames: Record<FormContainerSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-none",
};

// The white "card" that wraps a whole form: background, border, shadow, width and spacing.
// It knows nothing about the fields inside it.
const FormContainer = ({ title, description, size = "lg", onSubmit, children }: FormContainerProps) => {
  return (
    <div
      className={`mx-auto w-full ${sizeClassNames[size]} rounded-xl border border-slate-200 bg-white shadow-sm`}
    >
      {(title || description) && (
        <div className="border-b border-slate-200 px-4 py-5 sm:px-8">
          {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      )}

      {/* noValidate: validation is handled by Zod, not the browser's built-in popups */}
      <form onSubmit={onSubmit} noValidate className="space-y-8 px-4 py-6 sm:px-8">
        {children}
      </form>
    </div>
  );
};

export default FormContainer;
