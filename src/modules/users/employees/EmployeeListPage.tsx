import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "../../../components/icon/Icon";
import List from "../../../components/list/List";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import type { AppLayoutContext } from "../../../components/layout/AppLayout";
import { useEmployeeStore, type Employee } from "../../../store/employeeStore";
import EmployeeCreatePage from "./EmployeeCreatePage";

// Shows the employee list; "Add Employee" (topbar) or "Edit" swaps it for EmployeeCreatePage.
// All API calls live in employeeStore.
const EmployeeListPage = () => {
  const employees = useEmployeeStore((state) => state.employees);
  const isLoading = useEmployeeStore((state) => state.isLoading);
  const fetchEmployees = useEmployeeStore((state) => state.fetchEmployees);
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee);

  // The topbar slot from AppLayout, where the "Add Employee" button goes
  const { topbarActions } = useOutletContext<AppLayoutContext>();

  // false = show the list, true = show the form
  const [isFormOpen, setIsFormOpen] = useState(false);
  // The employee being edited; null = the form adds a new employee
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  // The employee waiting for delete confirmation; null = no popup
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  // Load the employees once when the page opens
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const openAddForm = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const openEditForm = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  // Back to the list
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  // Runs when "Delete" is clicked in the confirm popup
  const confirmDelete = async () => {
    if (!deletingEmployee) return;
    await deleteEmployee(deletingEmployee.id);
    setDeletingEmployee(null);
  };

  // The form is a separate component, so it starts fresh every time it opens
  if (isFormOpen) {
    return <EmployeeCreatePage employee={editingEmployee} onClose={closeForm} />;
  }

  return (
    <>
      {/* "Add Employee" in the topbar, only while the list is showing */}
      {topbarActions &&
        createPortal(
          <Button size="lg" onClick={openAddForm} aria-label="Add Employee">
            <Icon name="Plus" size={16} />
            {/* Icon only on phones, to save space */}
            <span className="hidden sm:inline">Add Employee</span>
          </Button>,
          topbarActions,
        )}

      <List
        items={employees}
        getKey={(employee) => employee.id}
        getSearchText={(employee) => `${employee.name} ${employee.email} ${employee.roleName}`}
        searchPlaceholder="Search employees..."
        isLoading={isLoading}
        emptyMessage="No employees yet. Click Add Employee to create one."
        columns={[
          {
            header: "Name",
            render: (employee) => <span className="font-medium text-slate-900">{employee.name}</span>,
            className: "whitespace-nowrap",
          },
          { header: "Email", render: (employee) => employee.email },
          {
            header: "Role",
            render: (employee) => <span className="capitalize">{employee.roleName || "-"}</span>,
            className: "whitespace-nowrap",
          },
          {
            header: "Status",
            render: (employee) => (
              <Badge variant={employee.isActive ? "secondary" : "destructive"}>
                {employee.isActive ? "Active" : "Inactive"}
              </Badge>
            ),
          },
          {
            header: "Actions",
            className: "whitespace-nowrap text-right",
            render: (employee) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditForm(employee)}
                  aria-label={`Edit ${employee.name}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Icon name="Pencil" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingEmployee(employee)}
                  aria-label={`Delete ${employee.name}`}
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
        open={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={confirmDelete}
        title="Delete employee"
        message={`Delete employee "${deletingEmployee?.name ?? ""}"? They will no longer be able to log in.`}
      />
    </>
  );
};

export default EmployeeListPage;
