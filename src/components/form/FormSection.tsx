import type { ReactNode } from "react";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";

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
    <FieldSet className="border-t pt-8 first:border-t-0 first:pt-0">
      <FieldLegend className="font-semibold">{title}</FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}

      <div className={`grid grid-cols-1 gap-x-6 gap-y-5 ${columnClassNames[columns]}`}>{children}</div>
    </FieldSet>
  );
};

export default FormSection;
