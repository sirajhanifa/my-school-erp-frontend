import { isAxiosError } from "axios";
import { create } from "zustand";
import api from "../components/axios/axios";
import type { AcademicYearFormValues } from "../schemas/academicYearSchema";
import { toast } from "./toastStore";

// An academic year as returned by the backend
export interface AcademicYear {
  id: string;
  name: string;
  description: string;
  // Status: true = Inactive, false = Active
  deleted: boolean;
  createdAt: string;
}

interface AcademicYearState {
  academicYears: AcademicYear[];
  isLoading: boolean;
  fetchAcademicYears: () => Promise<void>;
  // These return true on success, so the page knows when to clear its form
  createAcademicYear: (values: AcademicYearFormValues) => Promise<boolean>;
  updateAcademicYear: (id: string, values: AcademicYearFormValues) => Promise<boolean>;
  deleteAcademicYear: (id: string) => Promise<boolean>;
}

// Shows the backend's message if there is one, otherwise the fallback
const getErrorMessage = (error: unknown, fallback: string) =>
  (isAxiosError(error) ? error.response?.data?.message : undefined) ?? fallback;

// Keeps the list sorted by name, the same order the backend returns
const sortByName = (academicYears: AcademicYear[]) =>
  [...academicYears].sort((a, b) => a.name.localeCompare(b.name));

// Holds the academic years of the logged-in user's school.
// The backend decides which school from the auth cookie, so we never send a school id.
export const useAcademicYearStore = create<AcademicYearState>()((set) => ({
  academicYears: [],
  // true at the start, so the page shows a spinner instead of "No academic years yet" before the first load
  isLoading: true,

  fetchAcademicYears: async () => {
    set({ isLoading: true });

    try {
      const response = await api.get("/academic-years");
      set({ academicYears: response.data.academicYears, isLoading: false });
    } catch (error) {
      set({ academicYears: [], isLoading: false });
      toast.error(getErrorMessage(error, "Could not load academic years"));
    }
  },

  // After each change we update the list from the response,
  // instead of loading the whole list again.
  createAcademicYear: async (values) => {
    try {
      const response = await api.post("/academic-years", values);
      set((state) => ({
        academicYears: sortByName([...state.academicYears, response.data.academicYear]),
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create the academic year"));
      return false;
    }
  },

  updateAcademicYear: async (id, values) => {
    try {
      const response = await api.put(`/academic-years/${id}`, values);
      set((state) => ({
        academicYears: sortByName(
          state.academicYears.map((academicYear) =>
            academicYear.id === id ? response.data.academicYear : academicYear,
          ),
        ),
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the academic year"));
      return false;
    }
  },

  deleteAcademicYear: async (id) => {
    try {
      const response = await api.delete(`/academic-years/${id}`);
      // Deleting makes the academic year Inactive; it stays in the list
      set((state) => ({
        academicYears: state.academicYears.map((academicYear) =>
          academicYear.id === id ? { ...academicYear, deleted: true } : academicYear,
        ),
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the academic year"));
      return false;
    }
  },
}));
