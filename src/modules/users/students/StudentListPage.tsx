import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router";
import { Button } from "@/components/ui/button";
import FilterBar from "../../../components/filter/FilterBar";
import Icon from "../../../components/icon/Icon";
import List from "../../../components/list/List";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import type { AppLayoutContext } from "../../../components/layout/AppLayout";
import { useFilterStore } from "../../../store/filterStore";
import { useStudentStore, type Student } from "../../../store/studentStore";
import StudentCreatePage from "./StudentCreatePage";

// Full name for the list and the delete confirmation
const getFullName = (student: Student) => `${student.firstName} ${student.lastName}`.trim();

// Shows the student list; "Add Student" (topbar) or "Edit" swaps it for StudentCreatePage.
// All API calls live in studentStore.
const StudentListPage = () => {
  const students = useStudentStore((state) => state.students);
  const isLoading = useStudentStore((state) => state.isLoading);
  const fetchStudents = useStudentStore((state) => state.fetchStudents);
  const deleteStudent = useStudentStore((state) => state.deleteStudent);

  // The topbar slot from AppLayout, where the "Add Student" button goes
  const { topbarActions } = useOutletContext<AppLayoutContext>();

  // false = show the list, true = show the form
  const [isFormOpen, setIsFormOpen] = useState(false);
  // The student being edited; null = the form adds a new student
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  // The student waiting for delete confirmation; null = no popup
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // The class / section picked in the FilterBar ("" = All)
  const classId = useFilterStore((state) => state.classId);
  const sectionId = useFilterStore((state) => state.sectionId);

  // Load the students when the page opens, and again after each Search.
  // Class is required here, so nothing is loaded until a class has been searched.
  useEffect(() => {
    if (classId) fetchStudents({ classId, sectionId });
  }, [fetchStudents, classId, sectionId]);

  const openAddForm = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const openEditForm = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  // Back to the list
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
  };

  // Runs when "Delete" is clicked in the confirm popup
  const confirmDelete = async () => {
    if (!deletingStudent) return;
    await deleteStudent(deletingStudent.id);
    setDeletingStudent(null);
  };

  // The form is a separate component, so it starts fresh every time it opens
  if (isFormOpen) {
    return <StudentCreatePage student={editingStudent} onClose={closeForm} />;
  }

  return (
    <>
      {/* "Add Student" in the topbar, only while the list is showing */}
      {topbarActions &&
        createPortal(
          <Button size="lg" onClick={openAddForm} aria-label="Add Student">
            <Icon name="Plus" size={16} />
            {/* Icon only on phones, to save space */}
            <span className="hidden sm:inline">Add Student</span>
          </Button>,
          topbarActions,
        )}

      {/* Students have no academic year yet, so only class and section */}
      <div className="mb-4">
        <FilterBar fields={["class", "section"]} required={["class"]} />
      </div>

      <List
        // No class searched yet: show an empty list with a hint instead of old results
        items={classId ? students : []}
        getKey={(student) => student.id}
        getSearchText={(student) =>
          `${student.admissionNo} ${getFullName(student)} ${student.className} ${student.sectionName} ${student.guardianName} ${student.phone}`
        }
        searchPlaceholder="Search students..."
        isLoading={classId ? isLoading : false}
        emptyMessage={
          classId
            ? "No students found. Click Add Student to create one."
            : "Select a class and click Search to see students."
        }
        columns={[
          { header: "Admission No", render: (student) => student.admissionNo, className: "whitespace-nowrap" },
          {
            header: "Name",
            render: (student) => <span className="font-medium text-slate-900">{getFullName(student)}</span>,
            className: "whitespace-nowrap",
          },
          { header: "Class", render: (student) => student.className || "-", className: "whitespace-nowrap" },
          { header: "Section", render: (student) => student.sectionName || "-", className: "whitespace-nowrap" },
          { header: "Gender", render: (student) => student.gender },
          { header: "Phone", render: (student) => student.phone || "-", className: "whitespace-nowrap" },
          {
            header: "Actions",
            className: "whitespace-nowrap text-right",
            render: (student) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditForm(student)}
                  aria-label={`Edit ${getFullName(student)}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Icon name="Pencil" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingStudent(student)}
                  aria-label={`Delete ${getFullName(student)}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmModal
        open={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={confirmDelete}
        title="Delete student"
        message={`Delete student "${deletingStudent ? getFullName(deletingStudent) : ""}"? This cannot be undone.`}
      />
    </>
  );
};

export default StudentListPage;
