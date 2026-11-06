import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "../../../components/icon/Icon";
import List from "../../../components/list/List";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import type { AppLayoutContext } from "../../../components/layout/AppLayout";
import { useClassStore, type SchoolClass } from "../../../store/classStore";
import { toDateString } from "../../../utils/date";
import ClassCreatePage from "./ClassCreatePage";

// Shows the class list; "Add Class" (topbar) or "Edit" swaps it for ClassCreatePage.
// All API calls live in classStore.
const ClassListPage = () => {
  const classes = useClassStore((state) => state.classes);
  const isLoading = useClassStore((state) => state.isLoading);
  const fetchClasses = useClassStore((state) => state.fetchClasses);
  const deleteClass = useClassStore((state) => state.deleteClass);

  // The topbar slot from AppLayout, where the "Add Class" button goes
  const { topbarActions } = useOutletContext<AppLayoutContext>();

  // false = show the list, true = show the form
  const [isFormOpen, setIsFormOpen] = useState(false);
  // The class being edited; null = the form adds a new class
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  // The class waiting for delete confirmation; null = no popup
  const [deletingClass, setDeletingClass] = useState<SchoolClass | null>(null);

  // Load the classes once when the page opens
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const openAddForm = () => {
    setEditingClass(null);
    setIsFormOpen(true);
  };

  const openEditForm = (cls: SchoolClass) => {
    setEditingClass(cls);
    setIsFormOpen(true);
  };

  // Back to the list
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingClass(null);
  };

  // Runs when "Delete" is clicked in the confirm popup
  const confirmDelete = async () => {
    if (!deletingClass) return;
    await deleteClass(deletingClass.id);
    setDeletingClass(null);
  };

  // The form is a separate component, so it starts fresh every time it opens
  if (isFormOpen) {
    return <ClassCreatePage cls={editingClass} onClose={closeForm} />;
  }

  return (
    <>
      {/* "Add Class" in the topbar, only while the list is showing */}
      {topbarActions &&
        createPortal(
          <Button size="lg" onClick={openAddForm} aria-label="Add Class">
            <Icon name="Plus" size={16} />
            {/* Icon only on phones, to save space */}
            <span className="hidden sm:inline">Add Class</span>
          </Button>,
          topbarActions,
        )}

      <List
        items={classes}
        getKey={(cls) => cls.id}
        getSearchText={(cls) => `${cls.name} ${cls.description} ${cls.deleted ? "Inactive" : "Active"}`}
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
            // Deleted classes are shown as Inactive
            header: "Status",
            render: (cls) => (
              <Badge variant={cls.deleted ? "destructive" : "secondary"}>
                {cls.deleted ? "Inactive" : "Active"}
              </Badge>
            ),
          },
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
                {/* An inactive class is already deleted, so it has no Delete button */}
                {!cls.deleted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingClass(cls)}
                    aria-label={`Delete ${cls.name}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <ConfirmModal
        open={!!deletingClass}
        onClose={() => setDeletingClass(null)}
        onConfirm={confirmDelete}
        title="Delete class"
        message={`Delete class "${deletingClass?.name ?? ""}"? This cannot be undone.`}
      />
    </>
  );
};

export default ClassListPage;
