import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { classSchema, type ClassFormValues } from "../../../schemas/classSchema";
import { useClassStore, type SchoolClass } from "../../../store/classStore";

interface ClassCreatePageProps {
  // The class being edited; null = add a new class
  cls: SchoolClass | null;
  // Called after a successful save or on Cancel, to go back to the list
  onClose: () => void;
}

// The Add / Edit Class form. Opened from ClassListPage.
const ClassCreatePage = ({ cls, onClose }: ClassCreatePageProps) => {
  const createClass = useClassStore((state) => state.createClass);
  const updateClass = useClassStore((state) => state.updateClass);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    // Edit: start with the class's values. Add: start empty and Active (checkbox checked).
    defaultValues: {
      name: cls?.name ?? "",
      description: cls?.description ?? "",
      deleted: cls?.deleted ?? false,
    },
  });

  // The store shows the toast and updates the list; we only close the form when it worked
  const onSubmit = async (values: ClassFormValues) => {
    const success = cls ? await updateClass(cls.id, values) : await createClass(values);

    if (success) onClose();
  };

  return (
    // max-w-none: the form fills the content area instead of a narrow centred card
    <Card className="mx-auto w-full max-w-none gap-0 py-0">
      <CardHeader className="border-b px-4 py-5 sm:px-8">
        <CardTitle className="text-lg font-semibold">{cls ? "Edit Class" : "Add Class"}</CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-6 sm:px-8">
        {/* noValidate: validation is handled by Zod, not the browser's built-in popups */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          <FieldSet className="border-t pt-8 first:border-t-0 first:pt-0">
            <FieldLegend className="font-semibold">Class Details</FieldLegend>
            <FieldDescription>Basic information about the class.</FieldDescription>

            {/* 2 columns from md up: Name on the left, Description across the full row */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              {/* data-invalid turns the label red when there is an error */}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="class-name">
                  Name
                  <span className="-ml-1.5 text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="class-name"
                  placeholder="e.g. Class 1"
                  aria-required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "class-name-error" : undefined}
                  {...register("name")}
                />
                {errors.name && <FieldError id="class-name-error">{errors.name.message}</FieldError>}
              </Field>

              {/* Checkbox is not a plain input, so Controller connects it to the form.
                  The form stores "deleted", so checked (Active) = deleted: false. */}
              <Field orientation="horizontal" className="md:self-end md:pb-2">
                <Controller
                  name="deleted"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="class-active"
                      checked={!field.value}
                      onCheckedChange={(checked) => field.onChange(!checked)}
                    />
                  )}
                />
                <FieldLabel htmlFor="class-active">Active</FieldLabel>
              </Field>

              <Field data-invalid={!!errors.description} className="md:col-span-2">
                <FieldLabel htmlFor="class-description">Description</FieldLabel>
                <Textarea
                  id="class-description"
                  rows={6}
                  placeholder="Optional"
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "class-description-error" : undefined}
                  className="resize-y"
                  {...register("description")}
                />
                {errors.description && (
                  <FieldError id="class-description-error">{errors.description.message}</FieldError>
                )}
              </Field>
            </div>
          </FieldSet>

          {/* Phones: full-width buttons stacked with the submit on top. From "sm" up: one row on the right. */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-w-24"
            >
              Cancel
            </Button>
            {/* aria-busy tells screen readers the form is being submitted */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="min-w-24"
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Please wait..." : cls ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClassCreatePage;
