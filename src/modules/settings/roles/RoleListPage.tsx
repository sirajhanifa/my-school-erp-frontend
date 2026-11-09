import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router";
import { Button } from "@/components/ui/button";
import Icon from "../../../components/icon/Icon";
import List from "../../../components/list/List";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import type { AppLayoutContext } from "../../../components/layout/AppLayout";
import { useRoleStore, type Role } from "../../../store/roleStore";
import { toDateString } from "../../../utils/date";
import RoleCreatePage from "./RoleCreatePage";

// Shows the role list; "Add Role" (topbar) or "Edit" swaps it for RoleCreatePage.
const RoleListPage = () => {
  const roles = useRoleStore((state) => state.roles);
  const isLoading = useRoleStore((state) => state.isLoading);
  const fetchRoles = useRoleStore((state) => state.fetchRoles);
  const deleteRole = useRoleStore((state) => state.deleteRole);

  // The topbar slot from AppLayout, where the "Add Role" button goes
  const { topbarActions } = useOutletContext<AppLayoutContext>();

  // false = show the list, true = show the form
  const [isFormOpen, setIsFormOpen] = useState(false);
  // The role being edited; null = the form adds a new role
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  // The role waiting for delete confirmation; null = no popup
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // Load the roles once when the page opens
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const openAddForm = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const openEditForm = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  // Back to the list
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRole(null);
  };

  // Runs when "Delete" is clicked in the confirm popup
  const confirmDelete = async () => {
    if (!deletingRole) return;
    await deleteRole(deletingRole.id);
    setDeletingRole(null);
  };

  // The form is a separate component, so it starts fresh every time it opens
  if (isFormOpen) {
    return <RoleCreatePage role={editingRole} onClose={closeForm} />;
  }

  return (
    <>
      {/* "Add Role" in the topbar, only while the list is showing */}
      {topbarActions &&
        createPortal(
          <Button size="lg" onClick={openAddForm} aria-label="Add Role">
            <Icon name="Plus" size={16} />
            {/* Icon only on phones, to save space */}
            <span className="hidden sm:inline">Add Role</span>
          </Button>,
          topbarActions,
        )}

      <List
        items={roles}
        getKey={(role) => role.id}
        getSearchText={(role) => `${role.name} ${role.description}`}
        searchPlaceholder="Search roles..."
        isLoading={isLoading}
        emptyMessage="No roles yet. Click Add Role to create one."
        columns={[
          {
            header: "Name",
            render: (role) => <span className="font-medium text-slate-900 capitalize">{role.name}</span>,
            className: "whitespace-nowrap",
          },
          { header: "Description", render: (role) => role.description || "-" },
          {
            header: "Created",
            render: (role) => toDateString(new Date(role.createdAt)),
            className: "whitespace-nowrap",
          },
          {
            header: "Actions",
            className: "whitespace-nowrap text-right",
            render: (role) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditForm(role)}
                  aria-label={`Edit ${role.name}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Icon name="Pencil" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingRole(role)}
                  aria-label={`Delete ${role.name}`}
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
        open={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        onConfirm={confirmDelete}
        title="Delete role"
        message={`Delete role "${deletingRole?.name ?? ""}"? This cannot be undone.`}
      />
    </>
  );
};

export default RoleListPage;
