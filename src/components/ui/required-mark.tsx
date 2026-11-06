import { cn } from "@/lib/utils";

// The red * shown after the label of a required field
function RequiredMark({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span className={cn("-ml-1.5 text-destructive", className)} aria-hidden="true" {...props}>
      *
    </span>
  );
}

export { RequiredMark };
