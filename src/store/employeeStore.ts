import { isAxiosError } from "axios";
import { create } from "zustand";
import api from "../components/axios/axios";
import type { EmployeeFormValues } from "../schemas/employeeSchema";
import { toast } from "./toastStore";

// An employee (a user of the school) as returned by the backend
export interface Employee {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

// A role an employee can have (for the form's dropdown)
export interface EmployeeRole {
  id: string;
  name: string;
}

// The filters the employee list understands ("" or missing = All)
export interface EmployeeFilter {
  roleId?: string;
}

// Counts list requests, so a slow old answer cannot overwrite a newer one
let latestRequestNo = 0;

interface EmployeeState {
  employees: Employee[];
  roles: EmployeeRole[];
  isLoading: boolean;
  // true until the roles have loaded (FilterBar waits for it)
  isRolesLoading: boolean;
  // Optional filter from FilterBar; nothing passed = all employees
  fetchEmployees: (filter?: EmployeeFilter) => Promise<void>;
  fetchRoles: () => Promise<void>;
  // These return true on success, so the page knows when to close its form
  createEmployee: (values: EmployeeFormValues) => Promise<boolean>;
  updateEmployee: (id: string, values: EmployeeFormValues) => Promise<boolean>;
  deleteEmployee: (id: string) => Promise<boolean>;
}

// Shows the backend's message if there is one, otherwise the fallback
const getErrorMessage = (error: unknown, fallback: string) =>
  (isAxiosError(error) ? error.response?.data?.message : undefined) ?? fallback;

// Keeps the list sorted by name, the same order the backend returns
const sortByName = (employees: Employee[]) =>
  [...employees].sort((a, b) => a.name.localeCompare(b.name));

// Holds the employees of the logged-in user's school.
// The backend decides which school from the auth cookie, so we never send a school id.
export const useEmployeeStore = create<EmployeeState>()((set) => ({
  employees: [],
  roles: [],
  // true at the start, so the page shows a spinner instead of "No employees yet" before the first load
  isLoading: true,
  isRolesLoading: true,

  fetchEmployees: async (filter = {}) => {
    set({ isLoading: true });

    // If the user changes the filter again before this request answers,
    // only the newest answer may fill the list.
    const requestNo = ++latestRequestNo;

    // Send only the filters that are set; "" means "All"
    const params = { roleId: filter.roleId || undefined };

    try {
      const response = await api.get("/employees", { params });
      if (requestNo !== latestRequestNo) return;
      set({ employees: response.data.employees, isLoading: false });
    } catch (error) {
      if (requestNo !== latestRequestNo) return;
      set({ employees: [], isLoading: false });
      toast.error(getErrorMessage(error, "Could not load employees"));
    }
  },

  fetchRoles: async () => {
    set({ isRolesLoading: true });

    try {
      const response = await api.get("/employees/roles");
      set({ roles: response.data.roles, isRolesLoading: false });
    } catch (error) {
      set({ isRolesLoading: false });
      toast.error(getErrorMessage(error, "Could not load roles"));
    }
  },

  // After each change we update the list from the response,
  // instead of loading the whole list again.
  createEmployee: async (values) => {
    try {
      const response = await api.post("/employees", values);
      set((state) => ({ employees: sortByName([...state.employees, response.data.employee]) }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create the employee"));
      return false;
    }
  },

  updateEmployee: async (id, values) => {
    try {
      const response = await api.put(`/employees/${id}`, values);
      set((state) => ({
        employees: sortByName(
          state.employees.map((employee) => (employee.id === id ? response.data.employee : employee)),
        ),
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the employee"));
      return false;
    }
  },

  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      set((state) => ({ employees: state.employees.filter((employee) => employee.id !== id) }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the employee"));
      return false;
    }
  },
}));
