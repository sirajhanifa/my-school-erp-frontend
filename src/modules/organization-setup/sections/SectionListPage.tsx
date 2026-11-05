import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router";
import { Button } from "@/components/ui/button";
import Icon from "../../../components/icon/Icon";
import List from "../../../components/list/List";
import type { AppLayoutContext } from "../../../components/layout/AppLayout";
import { useSectionStore, type Section } from "../../../store/sectionStore";
import { toDateString } from "../../../utils/date";
import SectionCreatePage from "./SectionCreatePage";

// Shows the section list; "Add Section" (topbar) or "Edit" swaps it for SectionCreatePage.
// All API calls live in sectionStore.
const SectionListPage = () => {
  const sections = useSectionStore((state) => state.sections);
  const isLoading = useSectionStore((state) => state.isLoading);
  const fetchSections = useSectionStore((state) => state.fetchSections);
  const deleteSection = useSectionStore((state) => state.deleteSection);

  // The topbar slot from AppLayout, where the "Add Section" button goes
  const { topbarActions } = useOutletContext<AppLayoutContext>();

  // false = show the list, true = show the form
  const [isFormOpen, setIsFormOpen] = useState(false);
  // The section being edited; null = the form adds a new section
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // Load the sections once when the page opens
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const openAddForm = () => {
    setEditingSection(null);
    setIsFormOpen(true);
  };

  const openEditForm = (section: Section) => {
    setEditingSection(section);
    setIsFormOpen(true);
  };

  // Back to the list
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSection(null);
  };

  const handleDelete = async (section: Section) => {
    if (!window.confirm(`Delete section "${section.name}"?`)) return;
    await deleteSection(section.id);
  };

  // The form is a separate component, so it starts fresh every time it opens
  if (isFormOpen) {
    return <SectionCreatePage section={editingSection} onClose={closeForm} />;
  }

  return (
    <>
      {/* "Add Section" in the topbar, only while the list is showing */}
      {topbarActions &&
        createPortal(
          <Button size="lg" onClick={openAddForm} aria-label="Add Section">
            <Icon name="Plus" size={16} />
            {/* Icon only on phones, to save space */}
            <span className="hidden sm:inline">Add Section</span>
          </Button>,
          topbarActions,
        )}

      <List
        items={sections}
        getKey={(section) => section.id}
        getSearchText={(section) => `${section.name} ${section.description}`}
        searchPlaceholder="Search sections..."
        isLoading={isLoading}
        emptyMessage="No sections yet. Click Add Section to create one."
        columns={[
          {
            header: "Name",
            render: (section) => <span className="font-medium text-slate-900">{section.name}</span>,
            className: "whitespace-nowrap",
          },
          { header: "Description", render: (section) => section.description || "-" },
          {
            header: "Created",
            render: (section) => toDateString(new Date(section.createdAt)),
            className: "whitespace-nowrap",
          },
          {
            header: "Actions",
            className: "whitespace-nowrap text-right",
            render: (section) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditForm(section)}
                  aria-label={`Edit ${section.name}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Icon name="Pencil" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(section)}
                  aria-label={`Delete ${section.name}`}
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

export default SectionListPage;
