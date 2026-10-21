import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
}

export interface ToastOptions {
  title?: string;
  // Milliseconds before auto-dismiss. Use 0 to keep the toast until closed.
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, options?: ToastOptions) => number;
  removeToast: (id: number) => void;
  clearToasts: () => void;
}

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 5;

let nextId = 1;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  addToast: (type, message, options = {}) => {
    const id = nextId++;
    const duration = options.duration ?? (type === "error" ? 6000 : DEFAULT_DURATION);

    // Auto-dismiss is handled by the Toaster so it can pause on hover.
    set((state) => ({
      // Keep only the newest few so the screen doesn't fill up.
      toasts: [...state.toasts, { id, type, message, title: options.title, duration }].slice(-MAX_TOASTS),
    }));

    return id;
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  clearToasts: () => set({ toasts: [] }),
}));

// Shorthand usable anywhere, including outside React (stores, axios interceptors, etc.).
// e.g. toast.success("Student saved") or toast.error("Failed", { title: "Error" })
const { addToast, removeToast, clearToasts } = useToastStore.getState();

export const toast = {
  success: (message: string, options?: ToastOptions) => addToast("success", message, options),
  error: (message: string, options?: ToastOptions) => addToast("error", message, options),
  warning: (message: string, options?: ToastOptions) => addToast("warning", message, options),
  info: (message: string, options?: ToastOptions) => addToast("info", message, options),
  dismiss: removeToast,
  clear: clearToasts,
};
