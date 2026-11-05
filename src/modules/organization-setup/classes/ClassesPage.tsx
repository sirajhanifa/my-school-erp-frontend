import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useOutletContext } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import FormContainer from "../../../components/form/FormContainer";
import FormInput from "../../../components/form/FormInput";
import FormSection from "../../../components/form/FormSection";
import FormTextarea from "../../../components/form/FormTextarea";
import FormActions from "../../../components/form/FormActions";
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
        // size="full": the form fills the content area instead of a narrow centred card
        <FormContainer
          title={editingClass ? "Edit Class" : "Add Class"}
          size="full"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* 2 columns from md up: Name on the left, Description across the full row */}
          <FormSection title="Class Details" description="Basic information about the class." columns={2}>
            <FormInput
              name="name"
              label="Name"
              placeholder="e.g. Class 1"
              register={register}
              required
              error={errors.name?.message}
            />
            <FormTextarea
              name="description"
              label="Description"
              placeholder="Optional"
              rows={6}
              register={register}
              error={errors.description?.message}
              className="md:col-span-2"
            />
          </FormSection>

          <FormActions
            submitLabel={editingClass ? "Update" : "Add"}
            isSubmitting={isSubmitting}
            onCancel={closeForm}
          />
        </FormContainer>
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
