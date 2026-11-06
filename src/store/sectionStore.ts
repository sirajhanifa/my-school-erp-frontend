import { isAxiosError } from "axios";
import { create } from "zustand";
import api from "../components/axios/axios";
import type { SectionFormValues } from "../schemas/sectionSchema";
import { toast } from "./toastStore";

// A section as returned by the backend
export interface Section {
  id: string;
  name: string;
  description: string;
  // Status: true = Inactive, false = Active
  deleted: boolean;
  createdAt: string;
}

interface SectionState {
  sections: Section[];
  isLoading: boolean;
  fetchSections: () => Promise<void>;
  // These return true on success, so the page knows when to clear its form
  createSection: (values: SectionFormValues) => Promise<boolean>;
  updateSection: (id: string, values: SectionFormValues) => Promise<boolean>;
  deleteSection: (id: string) => Promise<boolean>;
}

// Shows the backend's message if there is one, otherwise the fallback
const getErrorMessage = (error: unknown, fallback: string) =>
  (isAxiosError(error) ? error.response?.data?.message : undefined) ?? fallback;

// Keeps the list sorted by name, the same order the backend returns
const sortByName = (sections: Section[]) =>
  [...sections].sort((a, b) => a.name.localeCompare(b.name));

// Holds the sections of the logged-in user's school.
// The backend decides which school from the auth cookie, so we never send a school id.
export const useSectionStore = create<SectionState>()((set) => ({
  sections: [],
  // true at the start, so the page shows a spinner instead of "No sections yet" before the first load
  isLoading: true,

  fetchSections: async () => {
    set({ isLoading: true });

    try {
      const response = await api.get("/sections");
      set({ sections: response.data.sections, isLoading: false });
    } catch (error) {
      set({ sections: [], isLoading: false });
      toast.error(getErrorMessage(error, "Could not load sections"));
    }
  },

  // After each change we update the list from the response,
  // instead of loading the whole list again.
  createSection: async (values) => {
    try {
      const response = await api.post("/sections", values);
      set((state) => ({ sections: sortByName([...state.sections, response.data.section]) }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create the section"));
      return false;
    }
  },

  updateSection: async (id, values) => {
    try {
      const response = await api.put(`/sections/${id}`, values);
      set((state) => ({
        sections: sortByName(
          state.sections.map((section) => (section.id === id ? response.data.section : section)),
        ),
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the section"));
      return false;
    }
  },

  deleteSection: async (id) => {
    try {
      const response = await api.delete(`/sections/${id}`);
      // Deleting makes the section Inactive; it stays in the list
      set((state) => ({
        sections: state.sections.map((section) =>
          section.id === id ? { ...section, deleted: true } : section,
        ),
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the section"));
      return false;
    }
  },
}));
