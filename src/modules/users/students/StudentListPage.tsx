import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router";
import { Button } from "@/components/ui/button";
import Icon from "../../../components/icon/Icon";
import List from "../../../components/list/List";
import type { AppLayoutContext } from "../../../components/layout/AppLayout";
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

  // Load the students once when the page opens
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`Delete student "${getFullName(student)}"?`)) return;
    await deleteStudent(student.id);
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

      <List
        items={students}
        getKey={(student) => student.id}
        getSearchText={(student) =>
          `${student.admissionNo} ${getFullName(student)} ${student.className} ${student.sectionName} ${student.guardianName} ${student.phone}`
        }
        searchPlaceholder="Search students..."
        isLoading={isLoading}
        emptyMessage="No students yet. Click Add Student to create one."
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
                  onClick={() => handleDelete(student)}
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
    </>
  );
};

export default StudentListPage;
