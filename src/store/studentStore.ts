import { isAxiosError } from "axios";
import { create } from "zustand";
import api from "../components/axios/axios";
import type { StudentFormValues } from "../schemas/studentSchema";
import { useFilterStore } from "./filterStore";
import { toast } from "./toastStore";

// A student as returned by the backend
export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string; // "YYYY-MM-DD"
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  guardianName: string;
  phone: string;
  address: string;
  createdAt: string;
}

// The filters the student list understands ("" or missing = All)
export interface StudentFilter {
  classId?: string;
  sectionId?: string;
}

// One problem found in an uploaded Excel file ("row" is the Excel row number)
export interface ImportError {
  row: number;
  message: string;
}

// Counts list requests, so a slow old answer cannot overwrite a newer one
let latestRequestNo = 0;

interface StudentState {
  students: Student[];
  isLoading: boolean;
  // Optional filter from FilterBar; nothing passed = all students
  fetchStudents: (filter?: StudentFilter) => Promise<void>;
  // These return true on success, so the page knows when to clear its form
  createStudent: (values: StudentFormValues) => Promise<boolean>;
  updateStudent: (id: string, values: StudentFormValues) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  // Excel import: downloads the template / uploads a filled file
  downloadTemplate: () => Promise<void>;
  // ok = all students saved; errors = the rows to fix (nothing is saved when there are errors)
  importStudents: (file: File) => Promise<{ ok: boolean; errors: ImportError[] }>;
}

// Shows the backend's message if there is one, otherwise the fallback
const getErrorMessage = (error: unknown, fallback: string) =>
  (isAxiosError(error) ? error.response?.data?.message : undefined) ?? fallback;

// Keeps the list sorted by admission number, the same order the backend returns.
// numeric: "2" comes before "10"
const sortByAdmissionNo = (students: Student[]) =>
  [...students].sort((a, b) => a.admissionNo.localeCompare(b.admissionNo, undefined, { numeric: true }));

// Holds the students of the logged-in user's school.
// The backend decides which school from the auth cookie, so we never send a school id.
export const useStudentStore = create<StudentState>()((set) => ({
  students: [],
  // true at the start, so the page shows a spinner instead of "No students yet" before the first load
  isLoading: true,

  fetchStudents: async (filter = {}) => {
    set({ isLoading: true });

    // Remember which request this is. If the user changes the filter again before this one
    // answers, only the newest answer may fill the list.
    const requestNo = ++latestRequestNo;

    // Send only the filters that are set; "" means "All"
    const params = {
      classId: filter.classId || undefined,
      sectionId: filter.sectionId || undefined,
    };

    try {
      const response = await api.get("/students", { params });
      if (requestNo !== latestRequestNo) return;
      set({ students: response.data.students, isLoading: false });
    } catch (error) {
      if (requestNo !== latestRequestNo) return;
      set({ students: [], isLoading: false });
      toast.error(getErrorMessage(error, "Could not load students"));
    }
  },

  // After each change we update the list from the response,
  // instead of loading the whole list again.
  createStudent: async (values) => {
    try {
      const response = await api.post("/students", values);
      set((state) => ({ students: sortByAdmissionNo([...state.students, response.data.student]) }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create the student"));
      return false;
    }
  },

  updateStudent: async (id, values) => {
    try {
      const response = await api.put(`/students/${id}`, values);
      set((state) => ({
        students: sortByAdmissionNo(
          state.students.map((student) => (student.id === id ? response.data.student : student)),
        ),
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the student"));
      return false;
    }
  },

  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      set((state) => ({ students: state.students.filter((student) => student.id !== id) }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the student"));
      return false;
    }
  },

  downloadTemplate: async () => {
    try {
      const response = await api.get("/students/import/template", { responseType: "blob" });
      // Save the file through a temporary link, since axios can't trigger a download itself
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "student-import-template.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // The error body is a blob here, so we can't read its message; show a fixed one
      toast.error("Could not download the template");
    }
  },

  importStudents: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      // Our axios default is JSON, which would turn the FormData into JSON; the browser adds the boundary
      const response = await api.post("/students/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(response.data.message);
      // Many students were added, so reload the list (with the current filter)
      const { classId, sectionId } = useFilterStore.getState();
      await useStudentStore.getState().fetchStudents({ classId, sectionId });
      return { ok: true, errors: [] };
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not import the students"));
      const errors: ImportError[] = (isAxiosError(error) && error.response?.data?.errors) || [];
      return { ok: false, errors };
    }
  },
}));
