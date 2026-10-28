import { isAxiosError } from "axios";
import { create } from "zustand";
import api from "../components/axios/axios";
import { toast } from "./toastStore";

// A submenu, e.g. "Admission" under "Students". It always opens a page.
export interface SubMenu {
  id: string;
  name: string;
  code: string;
  icon: string; // lucide-react icon name, e.g. "UserPlus"
  path: string;
}

// A main menu, e.g. "Students".
// If it has submenus it only groups them; otherwise it links directly to its own path.
export interface MainMenu {
  id: string;
  name: string;
  code: string;
  icon: string;
  path: string;
  subMenus: SubMenu[];
}

interface ModuleState {
  modules: MainMenu[];
  isLoading: boolean;
  fetchModules: () => Promise<void>;
  reset: () => void;
}

// Holds the menu of the logged-in user's school.
// The backend decides which school from the auth cookie, so we never send a school id.
export const useModuleStore = create<ModuleState>()((set) => ({
  modules: [],
  isLoading: false,

  fetchModules: async () => {
    set({ isLoading: true });

    try {
      const response = await api.get("/modules");
      set({ modules: response.data.modules, isLoading: false });
    } catch (error) {
      // Keep the menu we already have, so a failed reload doesn't empty the sidebar
      set({ isLoading: false });
      // Show the backend's message if there is one, otherwise a generic one
      const message = isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message ?? "Could not load the menu");
    }
  },

  // Called on logout, so the next user never sees the previous school's menu
  reset: () => set({ modules: [], isLoading: false }),
}));
