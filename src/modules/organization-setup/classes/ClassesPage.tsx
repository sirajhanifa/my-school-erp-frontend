import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useOutletContext } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import FormContainer from "../../../components/form/FormContainer";
import FormInput from "../../../components/form/FormInput";
import FormTextarea from "../../../components/form/FormTextarea";
import FormActions from "../../../components/form/FormActions";
import Icon from "../../../components/icon/Icon";
import List from "../../../components/list/List";
import type { AppLayoutContext } from "../../../components/layout/AppLayout";
import { classSchema, type ClassFormValues } from "../../../schemas/classSchema";
import { useClassStore, type SchoolClass } from "../../../store/classStore";
import { toDateString } from "../../../utils/date";

const emptyForm: ClassFormValues = { name: "", description: "" };

// Same look as the form's submit button, a bit shorter to fit the topbar
const addButtonClassName =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-bold text-white " +
  "shadow-sm transition duration-150 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] sm:px-4 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

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
          <button type="button" onClick={openAddForm} aria-label="Add Class" className={addButtonClassName}>
            <Icon name="Plus" size={16} />
            {/* Icon only on phones, to save space */}
            <span className="hidden sm:inline">Add Class</span>
          </button>,
          topbarActions,
        )}

      {isFormOpen ? (
        <FormContainer title={editingClass ? "Edit Class" : "Add Class"} onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
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
              rows={3}
              register={register}
              error={errors.description?.message}
            />
          </div>

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
                  <button
                    type="button"
                    onClick={() => openEditForm(cls)}
                    aria-label={`Edit ${cls.name}`}
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                  >
                    <Icon name="Pencil" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cls)}
                    aria-label={`Delete ${cls.name}`}
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
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
