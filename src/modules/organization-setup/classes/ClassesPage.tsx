import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AppLayout from "../../../components/layout/AppLayout";
import FormContainer from "../../../components/form/FormContainer";
import FormInput from "../../../components/form/FormInput";
import FormTextarea from "../../../components/form/FormTextarea";
import FormActions from "../../../components/form/FormActions";
import Icon from "../../../components/icon/Icon";
import List from "../../../components/list/List";
import { classSchema, type ClassFormValues } from "../../../schemas/classSchema";
import { useClassStore, type SchoolClass } from "../../../store/classStore";
import { toDateString } from "../../../utils/date";

const emptyForm: ClassFormValues = { name: "", description: "" };

// Form on top adds a class (or edits the one picked with "Edit"), list below.
// All API calls live in classStore.
const ClassesPage = () => {
  const classes = useClassStore((state) => state.classes);
  const isLoading = useClassStore((state) => state.isLoading);
  const fetchClasses = useClassStore((state) => state.fetchClasses);
  const createClass = useClassStore((state) => state.createClass);
  const updateClass = useClassStore((state) => state.updateClass);
  const deleteClass = useClassStore((state) => state.deleteClass);

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

  // Back to "Add" mode with an empty form
  const resetForm = () => {
    setEditingClass(null);
    reset(emptyForm);
  };

  const startEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    reset({ name: cls.name, description: cls.description });
  };

  // The store shows the success/error toast; we only clear the form when it worked
  const onSubmit = async (values: ClassFormValues) => {
    const success = editingClass
      ? await updateClass(editingClass.id, values)
      : await createClass(values);

    if (success) resetForm();
  };

  const handleDelete = async (cls: SchoolClass) => {
    if (!window.confirm(`Delete class "${cls.name}"?`)) return;

    const success = await deleteClass(cls.id);
    // If the deleted class was open in the form, clear the form
    if (success && editingClass?.id === cls.id) resetForm();
  };

  return (
    <AppLayout title="Classes">
      <div className="mx-auto max-w-4xl space-y-6">
        <FormContainer
          title={editingClass ? "Edit Class" : "Add Class"}
          size="full"
          onSubmit={handleSubmit(onSubmit)}
        >
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
            // Cancel only makes sense while editing
            {...(editingClass && { onCancel: resetForm })}
          />
        </FormContainer>

        <List
          items={classes}
          getKey={(cls) => cls.id}
          getSearchText={(cls) => `${cls.name} ${cls.description}`}
          searchPlaceholder="Search classes..."
          isLoading={isLoading}
          emptyMessage="No classes yet. Add your first class above."
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
                    onClick={() => startEdit(cls)}
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
      </div>
    </AppLayout>
  );
};

export default ClassesPage;
