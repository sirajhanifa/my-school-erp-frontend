import { useEffect, useId, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useController } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import FormField from "./FormField";
import Spinner from "./Spinner";
import { getInputClassName } from "./formStyles";
import type { SelectOption } from "./types";

type FormAutocompleteProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  // Show a loading row, e.g. while options are fetched from the API.
  loading?: boolean;
  // Optional: called on every keystroke so the parent can fetch matching options
  // from the server. Without it, the given options are filtered locally.
  onSearch?: (searchText: string) => void;
  noOptionsText?: string;
  className?: string;
};

// A searchable dropdown for long lists (e.g. Program, Department, Route, Hostel).
// The form value is the selected option's `value` ("" when nothing is selected).
function FormAutocomplete<T extends FieldValues>({
  name,
  label,
  control,
  options,
  placeholder = "Type to search...",
  required,
  disabled,
  loading = false,
  onSearch,
  noOptionsText = "No results found",
  className,
}: FormAutocompleteProps<T>) {
  const id = useId();
  const listboxId = `${id}-listbox`;

  // useController is the hook version of <Controller>. It is used here because
  // this component also needs its own state (search text, open/closed).
  const { field, fieldState } = useController({ name, control, disabled });
  const { ref: inputRef, value, onChange, onBlur, disabled: isDisabled } = field;
  const error = fieldState.error?.message;

  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchText.trim().toLowerCase()),
  );

  // While typing, show the search text. Otherwise, show the selected option's label.
  const inputValue = isOpen ? searchText : (selectedOption?.label ?? "");

  // Keep the highlighted option visible when moving with the arrow keys.
  useEffect(() => {
    if (activeIndex >= 0) {
      document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [id, activeIndex]);

  function openList() {
    setIsOpen(true);
    setSearchText("");
    setActiveIndex(-1);
  }

  function closeList() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function selectOption(option: SelectOption) {
    onChange(option.value);
    closeList();
  }

  function clearSelection() {
    onChange("");
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    setSearchText(text);
    setIsOpen(true);
    setActiveIndex(0);
    onSearch?.(text);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        openList();
        return;
      }
      setActiveIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && isOpen) {
      // Stop Enter from submitting the form while the list is open.
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option) {
        selectOption(option);
      }
    } else if (event.key === "Escape") {
      closeList();
    }
  }

  function handleBlur() {
    closeList();
    onBlur();
  }

  return (
    <FormField id={id} label={label} required={required} error={error} className={className}>
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          name={name}
          type="text"
          role="combobox"
          autoComplete="off"
          placeholder={placeholder}
          disabled={isDisabled}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={openList}
          onClick={() => !isOpen && openList()}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${getInputClassName(!!error)} pr-9`}
        />

        {/* Right side of the input: spinner while loading, or a clear (x) button */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          {loading ? (
            <Spinner />
          ) : (
            selectedOption &&
            !isOpen &&
            !isDisabled && (
              <button
                type="button"
                onClick={clearSelection}
                aria-label={`Clear ${label}`}
                className="rounded text-slate-400 hover:text-slate-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            )
          )}
        </div>

        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg"
          >
            {loading && <li className="px-3 py-2 text-slate-500">Loading...</li>}

            {!loading && filteredOptions.length === 0 && (
              <li className="px-3 py-2 text-slate-500">{noOptionsText}</li>
            )}

            {!loading &&
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;

                return (
                  <li
                    key={option.value}
                    id={`${id}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    // onMouseDown (not onClick) so the input does not lose focus first.
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectOption(option);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`cursor-pointer px-3 py-2 ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-700"} ${isSelected ? "font-medium" : ""}`}
                  >
                    {option.label}
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </FormField>
  );
}

export default FormAutocomplete;
