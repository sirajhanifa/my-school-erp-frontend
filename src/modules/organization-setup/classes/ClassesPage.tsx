import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import AppLayout from "../../../components/layout/AppLayout";
import FormContainer from "../../../components/form/FormContainer";
import FormInput from "../../../components/form/FormInput";
import FormTextarea from "../../../components/form/FormTextarea";
import FormActions from "../../../components/form/FormActions";
import Icon from "../../../components/icon/Icon";
import List from "../../../components/list/List";
import api from "../../../components/axios/axios";
import { classSchema, type ClassFormValues } from "../../../schemas/classSchema";
import { toast } from "../../../store/toastStore";
import { toDateString } from "../../../utils/date";

// A class as returned by the backend
interface SchoolClass {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

const emptyForm: ClassFormValues = { name: "", description: "" };

// Shows the backend's message if there is one, otherwise the fallback
const getErrorMessage = (error: unknown, fallback: string) =>
  (isAxiosError(error) ? error.response?.data?.message : undefined) ?? fallback;

// One page for everything: the form at the top adds a class (or edits the one picked
// with "Edit"), and the table below lists the school's classes.
const ClassesPage = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Increase this to load the list again (after adding, updating or deleting a class)
  const [reloadCount, setReloadCount] = useState(0);
  const reloadClasses = () => setReloadCount((count) => count + 1);

  // Load the classes when the page opens, and again whenever reloadCount changes
  useEffect(() => {
    api
      .get("/classes")
      .then((response) => setClasses(response.data.classes))
      .catch((error) => toast.error(getErrorMessage(error, "Could not load classes")))
      .finally(() => setIsLoading(false));
  }, [reloadCount]);

  // Back to "Add" mode with an empty form
  const resetForm = () => {
    setEditingClass(null);
    reset(emptyForm);
  };

  const startEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    reset({ name: cls.name, description: cls.description });
  };

  const onSubmit = async (values: ClassFormValues) => {
    try {
      const response = editingClass
        ? await api.put(`/classes/${editingClass.id}`, values)
        : await api.post("/classes", values);

      toast.success(response.data.message);
      resetForm();
      reloadClasses();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save the class"));
    }
  };

  const handleDelete = async (cls: SchoolClass) => {
    if (!window.confirm(`Delete class "${cls.name}"?`)) return;

    try {
      const response = await api.delete(`/classes/${cls.id}`);
      toast.success(response.data.message);
      // If the deleted class was open in the form, clear the form
      if (editingClass?.id === cls.id) resetForm();
      reloadClasses();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the class"));
    }
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
