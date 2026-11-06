import { create } from "zustand";
import { persist } from "zustand/middleware";

// The values picked in the FilterBar. "" means "All".
export interface FilterValues {
  academicYearId: string;
  classId: string;
  sectionId: string;
  roleId: string;
}

interface FilterState extends FilterValues {
  // Change one or more values, e.g. setFilter({ classId: "abc" })
  setFilter: (values: Partial<FilterValues>) => void;
  // Back to "All" everywhere (used on logout)
  reset: () => void;
}

export const EMPTY_FILTER: FilterValues = { academicYearId: "", classId: "", sectionId: "", roleId: "" };

// One shared filter for the whole app, so the selection follows the user from page to page.
// persist: saved in localStorage, so it also survives a page refresh.
// The school is not here: the backend takes it from the auth cookie.
export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...EMPTY_FILTER,
      setFilter: (values) => set(values),
      reset: () => set(EMPTY_FILTER),
    }),
    { name: "school-filter" },
  ),
);
