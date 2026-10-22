import { isAxiosError } from "axios";
import { create } from "zustand";
import api from "../components/axios/axios";
import type { ClassFormValues } from "../schemas/classSchema";
import { toast } from "./toastStore";

// A class as returned by the backend
export interface SchoolClass {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface ClassState {
  classes: SchoolClass[];
  isLoading: boolean;
  fetchClasses: () => Promise<void>;
  // These return true on success, so the page knows when to clear its form
  createClass: (values: ClassFormValues) => Promise<boolean>;
  updateClass: (id: string, values: ClassFormValues) => Promise<boolean>;
  deleteClass: (id: string) => Promise<boolean>;
}

// Shows the backend's message if there is one, otherwise the fallback
const getErrorMessage = (error: unknown, fallback: string) =>
  (isAxiosError(error) ? error.response?.data?.message : undefined) ?? fallback;

// Keeps the list sorted by name, the same order the backend returns
const sortByName = (classes: SchoolClass[]) =>
  [...classes].sort((a, b) => a.name.localeCompare(b.name));

// Holds the classes of the logged-in user's school.
// The backend decides which school from the auth cookie, so we never send a school id.
export const useClassStore = create<ClassState>()((set) => ({
  classes: [],
  // true at the start, so the page shows a spinner instead of "No classes yet" before the first load
  isLoading: true,

  fetchClasses: async () => {
    set({ isLoading: true });

    try {
      const response = await api.get("/classes");
      set({ classes: response.data.classes, isLoading: false });
    } catch (error) {
      set({ classes: [], isLoading: false });
      toast.error(getErrorMessage(error, "Could not load classes"));
    }
  },

  // After each change we update the list from the response,
  // instead of loading the whole list again.
  createClass: async (values) => {
    try {
      const response = await api.post("/classes", values);
      set((state) => ({ classes: sortByName([...state.classes, response.data.class]) }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create the class"));
      return false;
    }
  },

  updateClass: async (id, values) => {
    try {
      const response = await api.put(`/classes/${id}`, values);
      set((state) => ({
        classes: sortByName(state.classes.map((cls) => (cls.id === id ? response.data.class : cls))),
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the class"));
      return false;
    }
  },

  deleteClass: async (id) => {
    try {
      const response = await api.delete(`/classes/${id}`);
      set((state) => ({ classes: state.classes.filter((cls) => cls.id !== id) }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the class"));
      return false;
    }
  },
}));
