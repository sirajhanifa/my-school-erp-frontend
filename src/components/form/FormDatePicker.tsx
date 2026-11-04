import { useId, useState } from "react";
import { useController } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Icon from "../icon/Icon";
import { fromDateString, toDateString } from "../../utils/date";
import FormField from "./FormField";

type FormDatePickerProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
  // Dates use the "YYYY-MM-DD" format, e.g. "2024-06-01".
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

// A button that opens a calendar in a popup.
// The form value is a "YYYY-MM-DD" string (or "" when empty).
function FormDatePicker<T extends FieldValues>({
  name,
  label,
  control,
  minDate,
  maxDate,
  placeholder = "Pick a date",
  required,
  disabled,
  className,
}: FormDatePickerProps<T>) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);

  // Pulled apart so the React lint rule doesn't treat the whole field as a ref
  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({ name, control, disabled });
  const error = fieldState.error?.message;

  const selectedDate = value ? fromDateString(value) : undefined;
  const fromDate = minDate ? fromDateString(minDate) : undefined;
  const toDate = maxDate ? fromDateString(maxDate) : undefined;

  // Treat closing the popup as leaving the field, so "onBlur" validation still runs
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) onBlur();
  };

  return (
    <FormField id={id} label={label} required={required} error={error} className={className}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          ref={ref}
          render={
            <Button
              id={id}
              variant="outline"
              disabled={disabled}
              aria-required={required}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className="h-9 w-full justify-between font-normal data-[empty=true]:text-muted-foreground"
              data-empty={!selectedDate}
            />
          }
        >
          {selectedDate
            ? selectedDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
            : placeholder}
          <Icon name="CalendarDays" size={16} className="text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedDate}
            defaultMonth={selectedDate}
            startMonth={fromDate}
            endMonth={toDate}
            // Grey out days outside minDate..maxDate
            disabled={[
              ...(fromDate ? [{ before: fromDate }] : []),
              ...(toDate ? [{ after: toDate }] : []),
            ]}
            onSelect={(date) => {
              onChange(date ? toDateString(date) : "");
              handleOpenChange(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </FormField>
  );
}

export default FormDatePicker;
