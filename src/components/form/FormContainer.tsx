import type { FormEventHandler, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

// The card that wraps a whole form: background, border, width and spacing.
// It knows nothing about the fields inside it.
const FormContainer = ({ title, description, size = "lg", onSubmit, children }: FormContainerProps) => {
  return (
    <Card className={`mx-auto w-full gap-0 py-0 ${sizeClassNames[size]}`}>
      {(title || description) && (
        <CardHeader className="border-b px-4 py-5 sm:px-8">
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className="px-4 py-6 sm:px-8">
        {/* noValidate: validation is handled by Zod, not the browser's built-in popups */}
        <form onSubmit={onSubmit} noValidate className="space-y-8">
          {children}
        </form>
      </CardContent>
    </Card>
  );
};

export default FormContainer;
