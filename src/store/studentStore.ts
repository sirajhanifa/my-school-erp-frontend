import { isAxiosError } from "axios";
import { create } from "zustand";
import api from "../components/axios/axios";
import type { StudentFormValues } from "../schemas/studentSchema";
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

interface StudentState {
  students: Student[];
  isLoading: boolean;
  fetchStudents: () => Promise<void>;
  // These return true on success, so the page knows when to clear its form
  createStudent: (values: StudentFormValues) => Promise<boolean>;
  updateStudent: (id: string, values: StudentFormValues) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
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

  fetchStudents: async () => {
    set({ isLoading: true });

    try {
      const response = await api.get("/students");
      set({ students: response.data.students, isLoading: false });
    } catch (error) {
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
}));
