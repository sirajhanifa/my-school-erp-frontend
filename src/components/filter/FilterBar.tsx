import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "../icon/Icon";
import { useAcademicYearStore } from "../../store/academicYearStore";
import { useClassStore } from "../../store/classStore";
import { useEmployeeStore } from "../../store/employeeStore";
import { EMPTY_FILTER, useFilterStore, type FilterValues } from "../../store/filterStore";
import { useSectionStore } from "../../store/sectionStore";

// The dropdowns a page can ask for
export type FilterField = "academicYear" | "class" | "section" | "role";

type FilterBarProps = {
  // Which dropdowns to show, in this order, e.g. ["class", "section"]
  fields: FilterField[];
  // Dropdowns that must be picked before Search works; they have no "All" option
  required?: FilterField[];
};

// The value of the "All" option inside the Select (the filter keeps "" for it)
const ALL = "all";

type Option = { label: string; value: string };

// Only active (not deleted) items can be picked in a filter.
// deleted is optional: roles come from the backend already without the deleted ones.
const toOptions = (list: { id: string; name: string; deleted?: boolean }[]): Option[] =>
  list.filter((item) => !item.deleted).map((item) => ({ label: item.name, value: item.id }));

// Shared filter dropdowns (Academic Year, Class, Section, Role) for list pages.
// Picking a value only changes the dropdown; the "Search" button saves it to filterStore,
// and the page (which reads filterStore) then loads its data.
// Usage: <FilterBar fields={["class", "section"]} required={["class"]} />
const FilterBar = ({ fields, required = [] }: FilterBarProps) => {
  const idPrefix = useId();

  // Required dropdowns left empty when Search was clicked; they show an error
  const [missingFields, setMissingFields] = useState<FilterField[]>([]);

  // The filter that was last searched with (the page reloads when this changes)
  const applied = useFilterStore();

  // What the dropdowns show right now. Starts with the last search, so coming back
  // to the page shows the same choices.
  const [draft, setDraft] = useState<FilterValues>(() => ({
    academicYearId: applied.academicYearId,
    classId: applied.classId,
    sectionId: applied.sectionId,
    roleId: applied.roleId,
  }));

  const academicYears = useAcademicYearStore((state) => state.academicYears);
  const isYearsLoading = useAcademicYearStore((state) => state.isLoading);
  const fetchAcademicYears = useAcademicYearStore((state) => state.fetchAcademicYears);

  const classes = useClassStore((state) => state.classes);
  const isClassesLoading = useClassStore((state) => state.isLoading);
  const fetchClasses = useClassStore((state) => state.fetchClasses);

  const sections = useSectionStore((state) => state.sections);
  const isSectionsLoading = useSectionStore((state) => state.isLoading);
  const fetchSections = useSectionStore((state) => state.fetchSections);

  const roles = useEmployeeStore((state) => state.roles);
  const isRolesLoading = useEmployeeStore((state) => state.isRolesLoading);
  const fetchRoles = useEmployeeStore((state) => state.fetchRoles);

  const showYear = fields.includes("academicYear");
  const showClass = fields.includes("class");
  const showSection = fields.includes("section");
  const showRole = fields.includes("role");

  // Load the options of the shown dropdowns when the page opens
  useEffect(() => {
    if (showYear) fetchAcademicYears();
  }, [showYear, fetchAcademicYears]);

  useEffect(() => {
    if (showClass) fetchClasses();
  }, [showClass, fetchClasses]);

  useEffect(() => {
    if (showSection) fetchSections();
  }, [showSection, fetchSections]);

  useEffect(() => {
    if (showRole) fetchRoles();
  }, [showRole, fetchRoles]);

  // Everything each dropdown needs, so they can all be handled the same way
  const config = {
    academicYear: {
      key: "academicYearId",
      label: "Academic Year",
      allLabel: "All academic years",
      // placeholder and error are only used when the dropdown is required
      placeholder: "Select academic year",
      error: "Please select an academic year",
      options: toOptions(academicYears),
      isLoading: isYearsLoading,
    },
    class: {
      key: "classId",
      label: "Class",
      allLabel: "All classes",
      placeholder: "Select class",
      error: "Please select a class",
      options: toOptions(classes),
      isLoading: isClassesLoading,
    },
    section: {
      key: "sectionId",
      label: "Section",
      allLabel: "All sections",
      placeholder: "Select section",
      error: "Please select a section",
      options: toOptions(sections),
      isLoading: isSectionsLoading,
    },
    role: {
      key: "roleId",
      label: "Role",
      allLabel: "All roles",
      placeholder: "Select role",
      error: "Please select a role",
      options: toOptions(roles),
      isLoading: isRolesLoading,
    },
  } as const;

  // Turns every value that is no longer in its list (deleted or made inactive) into "" (All).
  // While a list is still loading its value is kept, otherwise every saved value looks unknown at first.
  const clean = (values: FilterValues): FilterValues => {
    const result = { ...values };
    for (const field of fields) {
      const { key, options, isLoading } = config[field];
      const isKnown = options.some((option) => option.value === result[key]);
      if (!isLoading && result[key] && !isKnown) result[key] = "";
    }
    return result;
  };

  // If the last search used a value that no longer exists, search again with "All" for it,
  // so the page does not stay on an empty list. (The dropdowns already show "All" for it.)
  const cleanApplied = clean(applied);
  const setFilter = applied.setFilter;
  useEffect(() => {
    setFilter(cleanApplied);
    // Only the values matter, not the object itself (which is new on every render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanApplied.academicYearId, cleanApplied.classId, cleanApplied.sectionId, cleanApplied.roleId, setFilter]);

  // "Search": the page reloads with the chosen values,
  // unless a required dropdown is empty; then it shows an error and does not search.
  const handleSearch = () => {
    const values = clean(draft);
    const missing = required.filter((field) => fields.includes(field) && !values[config[field].key]);
    setMissingFields(missing);
    if (missing.length > 0) return;

    setFilter(values);
  };

  // "Clear": everything back to "All" (or empty for required dropdowns).
  // Saved right away, so the page shows its full list, or its "please select" message.
  const handleClear = () => {
    setDraft(EMPTY_FILTER);
    setFilter(EMPTY_FILTER);
    setMissingFields([]);
  };

  // Picking a value also hides that dropdown's error
  const handleChange = (field: FilterField, value: string) => {
    setDraft((current) => ({ ...current, [config[field].key]: value }));
    setMissingFields((current) => current.filter((item) => item !== field));
  };

  return (
    <form
      onSubmit={(event) => {
        // Stop the browser from reloading the page
        event.preventDefault();
        handleSearch();
      }}
      className="grid gap-4 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-4"
    >
      {fields.map((field) => {
        const { key, label, allLabel, placeholder, error, options } = config[field];
        return (
          <FilterSelect
            key={field}
            id={`${idPrefix}-${field}`}
            label={label}
            allLabel={allLabel}
            placeholder={placeholder}
            options={options}
            isRequired={required.includes(field)}
            error={missingFields.includes(field) ? error : ""}
            value={draft[key]}
            onChange={(value) => handleChange(field, value)}
          />
        );
      })}

      {/* Buttons line up with the dropdowns, not with their labels or errors */}
      <div className="flex items-start gap-2 sm:pt-6">
        <Button type="submit" size="lg" className="flex-1 sm:flex-none">
          <Icon name="Search" size={16} />
          Search
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </form>
  );
};

type FilterSelectProps = {
  id: string;
  label: string;
  allLabel: string;
  placeholder: string; // shown when a required dropdown has nothing picked
  value: string; // "" = All (or nothing picked, for a required dropdown)
  options: readonly Option[];
  isRequired: boolean;
  error: string; // "" = no error
  onChange: (value: string) => void;
};

// One labelled dropdown. Optional: "All" option on top. Required: no "All", a placeholder instead.
const FilterSelect = ({
  id,
  label,
  allLabel,
  placeholder,
  value,
  options,
  isRequired,
  error,
  onChange,
}: FilterSelectProps) => {
  const isKnownValue = options.some((option) => option.value === value);

  // "items" tells the Select which label to show for the selected value
  const items = isRequired ? [...options] : [{ label: allLabel, value: ALL }, ...options];

  // Until the saved value is found in the loaded options:
  // optional shows "All", required shows the placeholder (null = nothing picked)
  const emptyValue = isRequired ? null : ALL;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {isRequired && <RequiredMark />}
      </Label>
      <Select
        items={items}
        value={isKnownValue ? value : emptyValue}
        onValueChange={(selected) => onChange(!selected || selected === ALL ? "" : String(selected))}
      >
        <SelectTrigger id={id} aria-invalid={!!error} aria-required={isRequired} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
};

export default FilterBar;
