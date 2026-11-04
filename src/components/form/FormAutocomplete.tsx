import { useId } from "react";
import { useController } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Spinner } from "@/components/ui/spinner";
import FormField from "./FormField";
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

  const { field, fieldState } = useController({ name, control, disabled });
  const error = fieldState.error?.message;

  // The Combobox works with whole option objects; the form only stores the value
  const selectedOption = options.find((option) => option.value === field.value) ?? null;

  return (
    <FormField id={id} label={label} required={required} error={error} className={className}>
      <Combobox
        items={options}
        value={selectedOption}
        onValueChange={(option: SelectOption | null) => field.onChange(option?.value ?? "")}
        itemToStringLabel={(option: SelectOption) => option.label}
        isItemEqualToValue={(a: SelectOption, b: SelectOption) => a.value === b.value}
        onInputValueChange={(text) => onSearch?.(text)}
        // When the server does the searching, show its results as they are
        filter={onSearch ? null : undefined}
        inputRef={field.ref}
        disabled={field.disabled}
      >
        <ComboboxInput
          id={id}
          name={name}
          placeholder={placeholder}
          onBlur={field.onBlur}
          showClear={!!selectedOption}
          disabled={field.disabled}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-9 w-full"
        />
        <ComboboxContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <Spinner />
              Loading...
            </div>
          ) : (
            <>
              <ComboboxEmpty>{noOptionsText}</ComboboxEmpty>
              <ComboboxList>
                {(option: SelectOption) => (
                  <ComboboxItem key={option.value} value={option}>
                    {option.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </>
          )}
        </ComboboxContent>
      </Combobox>
    </FormField>
  );
}

export default FormAutocomplete;
