import { isAxiosError } from "axios";
import { create } from "zustand";
import api from "../components/axios/axios";
import type { RoleFormValues } from "../schemas/roleSchema";
import type { MainMenu } from "./moduleStore";
import { toast } from "./toastStore";

// The superadmin role always has access to every module (the backend checks this too)
export const FULL_ACCESS_ROLE = "superadmin";

// A role as returned by the backend
export interface Role {
  id: string;
  name: string;
  description: string;
  modules: string[]; // menu codes this role can open
  createdAt: string;
}

interface RoleState {
  roles: Role[];
  isLoading: boolean;
  // The school's full menu, shown as checkboxes on the Role form
  allModules: MainMenu[];
  isModulesLoading: boolean;
  fetchRoles: () => Promise<void>;
  fetchAllModules: () => Promise<void>;
  // These return true on success, so the page knows when to close its form
  createRole: (values: RoleFormValues) => Promise<boolean>;
  updateRole: (id: string, values: RoleFormValues) => Promise<boolean>;
  deleteRole: (id: string) => Promise<boolean>;
}

// Shows the backend's message if there is one, otherwise the fallback
const getErrorMessage = (error: unknown, fallback: string) =>
  (isAxiosError(error) ? error.response?.data?.message : undefined) ?? fallback;

// Keeps the list sorted by name, the same order the backend returns
const sortByName = (roles: Role[]) => [...roles].sort((a, b) => a.name.localeCompare(b.name));

export const useRoleStore = create<RoleState>()((set) => ({
  roles: [],
  // true at the start, so the page shows placeholders instead of "No roles yet" before the first load
  isLoading: true,
  allModules: [],
  isModulesLoading: false,

  fetchAllModules: async () => {
    set({ isModulesLoading: true });

    try {
      const response = await api.get("/modules/all");
      set({ allModules: response.data.modules, isModulesLoading: false });
    } catch (error) {
      set({ allModules: [], isModulesLoading: false });
      toast.error(getErrorMessage(error, "Could not load the modules"));
    }
  },

  fetchRoles: async () => {
    set({ isLoading: true });

    try {
      const response = await api.get("/roles");
      set({ roles: response.data.roles, isLoading: false });
    } catch (error) {
      set({ roles: [], isLoading: false });
      toast.error(getErrorMessage(error, "Could not load roles"));
    }
  },

  // After each change we update the list from the response, instead of loading it all again
  createRole: async (values) => {
    try {
      const response = await api.post("/roles", values);
      set((state) => ({ roles: sortByName([...state.roles, response.data.role]) }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create the role"));
      return false;
    }
  },

  updateRole: async (id, values) => {
    try {
      const response = await api.put(`/roles/${id}`, values);
      set((state) => ({
        roles: sortByName(state.roles.map((role) => (role.id === id ? response.data.role : role))),
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the role"));
      return false;
    }
  },

  deleteRole: async (id) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      set((state) => ({ roles: state.roles.filter((role) => role.id !== id) }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the role"));
      return false;
    }
  },
}));
