import type { ReactNode } from "react";

type FormSectionColumns = 1 | 2 | 3;

type FormSectionProps = {
  title: string;
  description?: string;
  columns?: FormSectionColumns;
  children: ReactNode;
};

// Always 1 column on mobile, then more columns on larger screens.
const columnClassNames: Record<FormSectionColumns, string> = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
};

// Groups related fields under a heading, e.g. "Student Information".
// To make one field span the full row, pass className="md:col-span-2" to that field.
const FormSection = ({ title, description, columns = 2, children }: FormSectionProps) => {
  return (
    <section className="border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>

      <div className={`grid grid-cols-1 gap-x-6 gap-y-5 ${columnClassNames[columns]}`}>{children}</div>
    </section>
  );
};

export default FormSection;
