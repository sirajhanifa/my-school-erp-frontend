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
import { sectionSchema, type SectionFormValues } from "../../../schemas/sectionSchema";
import { useSectionStore, type Section } from "../../../store/sectionStore";

interface SectionCreatePageProps {
  // The section being edited; null = add a new section
  section: Section | null;
  // Called after a successful save or on Cancel, to go back to the list
  onClose: () => void;
}

// The Add / Edit Section form. Opened from SectionListPage.
const SectionCreatePage = ({ section, onClose }: SectionCreatePageProps) => {
  const createSection = useSectionStore((state) => state.createSection);
  const updateSection = useSectionStore((state) => state.updateSection);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    // Edit: start with the section's values. Add: start empty and Active (checkbox checked).
    defaultValues: {
      name: section?.name ?? "",
      description: section?.description ?? "",
      deleted: section?.deleted ?? false,
    },
  });

  // The store shows the toast and updates the list; we only close the form when it worked
  const onSubmit = async (values: SectionFormValues) => {
    const success = section
      ? await updateSection(section.id, values)
      : await createSection(values);

    if (success) onClose();
  };

  return (
    // max-w-none: the form fills the content area instead of a narrow centred card
    <Card className="mx-auto w-full max-w-none gap-0 py-0">
      <CardHeader className="border-b px-4 py-5 sm:px-8">
        <CardTitle className="text-lg font-semibold">
          {section ? "Edit Section" : "Add Section"}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-6 sm:px-8">
        {/* noValidate: validation is handled by Zod, not the browser's built-in popups */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          <FieldSet className="border-t pt-8 first:border-t-0 first:pt-0">
            <FieldLegend className="font-semibold">Section Details</FieldLegend>
            <FieldDescription>Basic information about the section.</FieldDescription>

            {/* 2 columns from md up: Name on the left, Description across the full row */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              {/* data-invalid turns the label red when there is an error */}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="section-name">
                  Name
                  <span className="-ml-1.5 text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="section-name"
                  placeholder="e.g. A"
                  aria-required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "section-name-error" : undefined}
                  {...register("name")}
                />
                {errors.name && <FieldError id="section-name-error">{errors.name.message}</FieldError>}
              </Field>

              {/* Checkbox is not a plain input, so Controller connects it to the form.
                  The form stores "deleted", so checked (Active) = deleted: false. */}
              <Field orientation="horizontal" className="md:self-end md:pb-2">
                <Controller
                  name="deleted"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="section-active"
                      checked={!field.value}
                      onCheckedChange={(checked) => field.onChange(!checked)}
                    />
                  )}
                />
                <FieldLabel htmlFor="section-active">Active</FieldLabel>
              </Field>

              <Field data-invalid={!!errors.description} className="md:col-span-2">
                <FieldLabel htmlFor="section-description">Description</FieldLabel>
                <Textarea
                  id="section-description"
                  rows={6}
                  placeholder="Optional"
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "section-description-error" : undefined}
                  className="resize-y"
                  {...register("description")}
                />
                {errors.description && (
                  <FieldError id="section-description-error">{errors.description.message}</FieldError>
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
              {isSubmitting ? "Please wait..." : section ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SectionCreatePage;
