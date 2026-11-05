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
import { classSchema, type ClassFormValues } from "../../../schemas/classSchema";
import { useClassStore, type SchoolClass } from "../../../store/classStore";
import { toDateString } from "../../../utils/date";

const emptyForm: ClassFormValues = { name: "", description: "" };

// Shows the class list; "Add Class" (topbar) or "Edit" swaps it for the form.
// All API calls live in classStore.
const ClassesPage = () => {
  const classes = useClassStore((state) => state.classes);
  const isLoading = useClassStore((state) => state.isLoading);
  const fetchClasses = useClassStore((state) => state.fetchClasses);
  const createClass = useClassStore((state) => state.createClass);
  const updateClass = useClassStore((state) => state.updateClass);
  const deleteClass = useClassStore((state) => state.deleteClass);

  // The topbar slot from AppLayout, where the "Add Class" button goes
  const { topbarActions } = useOutletContext<AppLayoutContext>();

  // false = show the list, true = show the form
  const [isFormOpen, setIsFormOpen] = useState(false);
  // The class being edited; null = the form adds a new class
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: emptyForm,
  });

  // Load the classes once when the page opens
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const openAddForm = () => {
    setEditingClass(null);
    reset(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (cls: SchoolClass) => {
    setEditingClass(cls);
    reset({ name: cls.name, description: cls.description });
    setIsFormOpen(true);
  };

  // Back to the list with an empty form; nothing is saved
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingClass(null);
    reset(emptyForm);
  };

  // The store shows the toast and updates the list; we only close the form when it worked
  const onSubmit = async (values: ClassFormValues) => {
    const success = editingClass
      ? await updateClass(editingClass.id, values)
      : await createClass(values);

    if (success) closeForm();
  };

  const handleDelete = async (cls: SchoolClass) => {
    if (!window.confirm(`Delete class "${cls.name}"?`)) return;
    await deleteClass(cls.id);
  };

  return (
    <>
      {/* "Add Class" in the topbar, only while the list is showing */}
      {topbarActions &&
        !isFormOpen &&
        createPortal(
          <Button size="lg" onClick={openAddForm} aria-label="Add Class">
            <Icon name="Plus" size={16} />
            {/* Icon only on phones, to save space */}
            <span className="hidden sm:inline">Add Class</span>
          </Button>,
          topbarActions,
        )}

      {isFormOpen ? (
        // max-w-none: the form fills the content area instead of a narrow centred card
        <Card className="mx-auto w-full max-w-none gap-0 py-0">
          <CardHeader className="border-b px-4 py-5 sm:px-8">
            <CardTitle className="text-lg font-semibold">{editingClass ? "Edit Class" : "Add Class"}</CardTitle>
          </CardHeader>

          <CardContent className="px-4 py-6 sm:px-8">
            {/* noValidate: validation is handled by Zod, not the browser's built-in popups */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
              <FieldSet className="border-t pt-8 first:border-t-0 first:pt-0">
                <FieldLegend className="font-semibold">Class Details</FieldLegend>
                <FieldDescription>Basic information about the class.</FieldDescription>

                {/* 2 columns from md up: Name on the left, Description across the full row */}
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
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
                      className="h-9"
                      {...register("name")}
                    />
                    {errors.name && <FieldError id="class-name-error">{errors.name.message}</FieldError>}
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
                  {isSubmitting ? "Please wait..." : editingClass ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <List
          items={classes}
          getKey={(cls) => cls.id}
          getSearchText={(cls) => `${cls.name} ${cls.description}`}
          searchPlaceholder="Search classes..."
          isLoading={isLoading}
          emptyMessage="No classes yet. Click Add Class to create one."
          columns={[
            {
              header: "Name",
              render: (cls) => <span className="font-medium text-slate-900">{cls.name}</span>,
              className: "whitespace-nowrap",
            },
            { header: "Description", render: (cls) => cls.description || "-" },
            {
              header: "Created",
              render: (cls) => toDateString(new Date(cls.createdAt)),
              className: "whitespace-nowrap",
            },
            {
              header: "Actions",
              className: "whitespace-nowrap text-right",
              render: (cls) => (
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditForm(cls)}
                    aria-label={`Edit ${cls.name}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Icon name="Pencil" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cls)}
                    aria-label={`Delete ${cls.name}`}
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

export default ClassesPage;
