import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useOutletContext } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import Icon from "../../../components/icon/Icon";
import List from "../../../components/list/List";
import type { AppLayoutContext } from "../../../components/layout/AppLayout";
import { sectionSchema, type SectionFormValues } from "../../../schemas/sectionSchema";
import { useSectionStore, type Section } from "../../../store/sectionStore";
import { toDateString } from "../../../utils/date";

const emptyForm: SectionFormValues = { name: "", description: "" };

// Shows the section list; "Add Section" (topbar) or "Edit" swaps it for the form.
// All API calls live in sectionStore.
const SectionsPage = () => {
  const sections = useSectionStore((state) => state.sections);
  const isLoading = useSectionStore((state) => state.isLoading);
  const fetchSections = useSectionStore((state) => state.fetchSections);
  const createSection = useSectionStore((state) => state.createSection);
  const updateSection = useSectionStore((state) => state.updateSection);
  const deleteSection = useSectionStore((state) => state.deleteSection);

  // The topbar slot from AppLayout, where the "Add Section" button goes
  const { topbarActions } = useOutletContext<AppLayoutContext>();

  // false = show the list, true = show the form
  const [isFormOpen, setIsFormOpen] = useState(false);
  // The section being edited; null = the form adds a new section
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: emptyForm,
  });

  // Load the sections once when the page opens
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const openAddForm = () => {
    setEditingSection(null);
    reset(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (section: Section) => {
    setEditingSection(section);
    reset({ name: section.name, description: section.description });
    setIsFormOpen(true);
  };

  // Back to the list with an empty form; nothing is saved
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSection(null);
    reset(emptyForm);
  };

  // The store shows the toast and updates the list; we only close the form when it worked
  const onSubmit = async (values: SectionFormValues) => {
    const success = editingSection
      ? await updateSection(editingSection.id, values)
      : await createSection(values);

    if (success) closeForm();
  };

  const handleDelete = async (section: Section) => {
    if (!window.confirm(`Delete section "${section.name}"?`)) return;
    await deleteSection(section.id);
  };

  return (
    <>
      {/* "Add Section" in the topbar, only while the list is showing */}
      {topbarActions &&
        !isFormOpen &&
        createPortal(
          <Button size="lg" onClick={openAddForm} aria-label="Add Section">
            <Icon name="Plus" size={16} />
            {/* Icon only on phones, to save space */}
            <span className="hidden sm:inline">Add Section</span>
          </Button>,
          topbarActions,
        )}

      {isFormOpen ? (
        // max-w-none: the form fills the content area instead of a narrow centred card
        <Card className="mx-auto w-full max-w-none gap-0 py-0">
          <CardHeader className="border-b px-4 py-5 sm:px-8">
            <CardTitle className="text-lg font-semibold">
              {editingSection ? "Edit Section" : "Add Section"}
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 py-6 sm:px-8">
            {/* noValidate: validation is handled by Zod, not the browser's built-in popups */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
              <FieldSet className="border-t pt-8 first:border-t-0 first:pt-0">
                <FieldLegend className="font-semibold">Section Details</FieldLegend>
                <FieldDescription>Basic information about the section.</FieldDescription>

                {/* 2 columns from md up: Name on the left, Description across the full row */}
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
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
                      className="h-9"
                      {...register("name")}
                    />
                    {errors.name && <FieldError id="section-name-error">{errors.name.message}</FieldError>}
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
                  onClick={closeForm}
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
                  {isSubmitting ? "Please wait..." : editingSection ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <List
          items={sections}
          getKey={(section) => section.id}
          getSearchText={(section) => `${section.name} ${section.description}`}
          searchPlaceholder="Search sections..."
          isLoading={isLoading}
          emptyMessage="No sections yet. Click Add Section to create one."
          columns={[
            {
              header: "Name",
              render: (section) => <span className="font-medium text-slate-900">{section.name}</span>,
              className: "whitespace-nowrap",
            },
            { header: "Description", render: (section) => section.description || "-" },
            {
              header: "Created",
              render: (section) => toDateString(new Date(section.createdAt)),
              className: "whitespace-nowrap",
            },
            {
              header: "Actions",
              className: "whitespace-nowrap text-right",
              render: (section) => (
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditForm(section)}
                    aria-label={`Edit ${section.name}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Icon name="Pencil" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(section)}
                    aria-label={`Delete ${section.name}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}
    </>
  );
};

export default SectionsPage;
