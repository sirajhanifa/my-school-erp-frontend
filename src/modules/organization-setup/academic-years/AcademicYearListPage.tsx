import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "../../../components/icon/Icon";
import List from "../../../components/list/List";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import type { AppLayoutContext } from "../../../components/layout/AppLayout";
import { useAcademicYearStore, type AcademicYear } from "../../../store/academicYearStore";
import { toDateString } from "../../../utils/date";
import AcademicYearCreatePage from "./AcademicYearCreatePage";

// Shows the academic year list; "Add Academic Year" (topbar) or "Edit" swaps it for AcademicYearCreatePage.
// All API calls live in academicYearStore.
const AcademicYearListPage = () => {
  const academicYears = useAcademicYearStore((state) => state.academicYears);
  const isLoading = useAcademicYearStore((state) => state.isLoading);
  const fetchAcademicYears = useAcademicYearStore((state) => state.fetchAcademicYears);
  const deleteAcademicYear = useAcademicYearStore((state) => state.deleteAcademicYear);

  // The topbar slot from AppLayout, where the "Add Academic Year" button goes
  const { topbarActions } = useOutletContext<AppLayoutContext>();

  // false = show the list, true = show the form
  const [isFormOpen, setIsFormOpen] = useState(false);
  // The academic year being edited; null = the form adds a new academic year
  const [editingAcademicYear, setEditingAcademicYear] = useState<AcademicYear | null>(null);
  // The academic year waiting for delete confirmation; null = no popup
  const [deletingAcademicYear, setDeletingAcademicYear] = useState<AcademicYear | null>(null);

  // Load the academic years once when the page opens
  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  const openAddForm = () => {
    setEditingAcademicYear(null);
    setIsFormOpen(true);
  };

  const openEditForm = (academicYear: AcademicYear) => {
    setEditingAcademicYear(academicYear);
    setIsFormOpen(true);
  };

  // Back to the list
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAcademicYear(null);
  };

  // Runs when "Delete" is clicked in the confirm popup
  const confirmDelete = async () => {
    if (!deletingAcademicYear) return;
    await deleteAcademicYear(deletingAcademicYear.id);
    setDeletingAcademicYear(null);
  };

  // The form is a separate component, so it starts fresh every time it opens
  if (isFormOpen) {
    return <AcademicYearCreatePage academicYear={editingAcademicYear} onClose={closeForm} />;
  }

  return (
    <>
      {/* "Add Academic Year" in the topbar, only while the list is showing */}
      {topbarActions &&
        createPortal(
          <Button size="lg" onClick={openAddForm} aria-label="Add Academic Year">
            <Icon name="Plus" size={16} />
            {/* Icon only on phones, to save space */}
            <span className="hidden sm:inline">Add Academic Year</span>
          </Button>,
          topbarActions,
        )}

      <List
        items={academicYears}
        getKey={(academicYear) => academicYear.id}
        getSearchText={(academicYear) =>
          `${academicYear.name} ${academicYear.description} ${academicYear.deleted ? "Inactive" : "Active"}`
        }
        searchPlaceholder="Search academic years..."
        isLoading={isLoading}
        emptyMessage="No academic years yet. Click Add Academic Year to create one."
        columns={[
          {
            header: "Name",
            render: (academicYear) => (
              <span className="font-medium text-slate-900">{academicYear.name}</span>
            ),
            className: "whitespace-nowrap",
          },
          { header: "Description", render: (academicYear) => academicYear.description || "-" },
          {
            // Deleted academic years are shown as Inactive
            header: "Status",
            render: (academicYear) => (
              <Badge variant={academicYear.deleted ? "destructive" : "secondary"}>
                {academicYear.deleted ? "Inactive" : "Active"}
              </Badge>
            ),
          },
          {
            header: "Created",
            render: (academicYear) => toDateString(new Date(academicYear.createdAt)),
            className: "whitespace-nowrap",
          },
          {
            header: "Actions",
            className: "whitespace-nowrap text-right",
            render: (academicYear) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditForm(academicYear)}
                  aria-label={`Edit ${academicYear.name}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Icon name="Pencil" size={16} />
                </Button>
                {/* An inactive academic year is already deleted, so it has no Delete button */}
                {!academicYear.deleted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingAcademicYear(academicYear)}
                    aria-label={`Delete ${academicYear.name}`}
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
        open={!!deletingAcademicYear}
        onClose={() => setDeletingAcademicYear(null)}
        onConfirm={confirmDelete}
        title="Delete academic year"
        message={`Delete academic year "${deletingAcademicYear?.name ?? ""}"? This cannot be undone.`}
      />
    </>
  );
};

export default AcademicYearListPage;
